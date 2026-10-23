import path from 'node:path';
import net from 'node:net';
import { root, readJson, exists } from './common.mjs';

export function normalizeBasePath(value = '/') {
  if (typeof value !== 'string' || !/^\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]*\/?$/.test(value))
    throw new Error('basePath must be / or a URL path such as /QCopilots-Website/.');
  return value === '/' ? '/' : `/${value.split('/').filter(Boolean).join('/')}/`;
}
export function normalizeConfig(value = {}, options = {}, repository = root) {
  const config = {
    host: options.host ?? value.host ?? '127.0.0.1',
    port: Number(options.port ?? value.port ?? 8080),
    adminPort: Number(options['admin-port'] ?? value.adminPort ?? 20199),
    runtimeDir: path.resolve(
      repository,
      options['runtime-dir'] ?? value.runtimeDir ?? '.qcopilots-deploy/native',
    ),
    sourceDir: path.resolve(repository, options.source ?? value.sourceDir ?? 'dist'),
    basePath: normalizeBasePath(options['base-path'] ?? value.basePath ?? '/'),
    domain: value.domain ?? null,
    email: value.email ?? null,
    serviceName: value.serviceName ?? 'qcopilots-website',
  };
  if (!net.isIP(config.host))
    throw new Error('host must be an IPv4 or IPv6 address. Use domain for a public hostname.');
  for (const field of ['port', 'adminPort'])
    if (!Number.isInteger(config[field]) || config[field] < 1024 || config[field] > 65535)
      throw new Error(`${field} must be an integer between 1024 and 65535.`);
  if (config.port === config.adminPort) throw new Error('port and adminPort must be different.');
  if (
    config.domain !== null &&
    (typeof config.domain !== 'string' ||
      !/^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/.test(
        config.domain,
      ))
  )
    throw new Error('domain must be a DNS hostname without scheme, path or port.');
  if (config.email !== null && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email))
    throw new Error('email must be a valid certificate contact email.');
  if (!/^[a-z][a-z0-9-]{2,63}$/.test(config.serviceName))
    throw new Error('serviceName must be 3–64 lowercase letters, numbers or hyphens.');
  return config;
}
export async function loadConfig(options = {}) {
  const file = path.resolve(root, options.config ?? 'config/deploy.json');
  if (options.config && !(await exists(file)))
    throw new Error(`Deployment config does not exist: ${file}`);
  return normalizeConfig(await readJson(file, {}), options);
}
export function listener(host, port) {
  return net.isIP(host) === 6 ? `[${host}]:${port}` : `${host}:${port}`;
}
export function localUrl(config) {
  const host = config.host === '0.0.0.0' ? '127.0.0.1' : config.host === '::' ? '::1' : config.host;
  return `http://${listener(host, config.port)}`;
}
export function caddyConfig(config, state, release) {
  const healthPath = `/_qcopilots/health/${state.instanceId}`;
  const content = [
    { handler: 'vars', root: release.siteDir },
    {
      handler: 'headers',
      response: {
        set: {
          'X-Content-Type-Options': ['nosniff'],
          'Referrer-Policy': ['strict-origin-when-cross-origin'],
          'X-QCopilots-Release': [release.id],
        },
      },
    },
    { handler: 'encode', encodings: { gzip: {} } },
    { handler: 'file_server', index_names: ['index.html'] },
  ];
  const siteRoute =
    config.basePath === '/'
      ? { handle: content }
      : {
          match: [{ path: [`${config.basePath}*`] }],
          handle: [
            { handler: 'rewrite', strip_path_prefix: config.basePath.slice(0, -1) },
            ...content,
          ],
        };
  const routes = [
    {
      match: [{ path: [healthPath] }],
      handle: [{ handler: 'static_response', body: release.id, status_code: 200 }],
    },
    ...(config.basePath === '/'
      ? []
      : [
          {
            match: [{ path: [config.basePath.slice(0, -1)] }],
            handle: [
              {
                handler: 'static_response',
                headers: { Location: [config.basePath] },
                status_code: 308,
              },
            ],
          },
        ]),
    siteRoute,
    { handle: [{ handler: 'error', status_code: 404 }] },
  ];
  const errors = {
    routes: [
      {
        handle: [
          { handler: 'rewrite', uri: '/404.html' },
          { handler: 'vars', root: release.siteDir },
          { handler: 'file_server', status_code: 404 },
        ],
      },
    ],
  };
  const servers = {
    [`qc-${state.instanceId}`]: {
      listen: [listener(config.host, config.port)],
      routes,
      errors,
      automatic_https: { disable: true },
    },
  };
  if (config.domain)
    servers[`public-${state.instanceId}`] = {
      listen: [':443'],
      routes: [{ match: [{ host: [config.domain] }], handle: [{ handler: 'subroute', routes }] }],
      errors,
    };
  return {
    admin: { listen: `127.0.0.1:${config.adminPort}`, config: { persist: false } },
    storage: { module: 'file_system', root: path.join(config.runtimeDir, 'caddy-data') },
    apps: {
      http: { servers },
      ...(config.domain && config.email
        ? {
            tls: {
              automation: {
                policies: [
                  { subjects: [config.domain], issuers: [{ module: 'acme', email: config.email }] },
                ],
              },
            },
          }
        : {}),
    },
  };
}
