# 真实运行截图 / Real-run screenshots

[中文](#中文) · [English](#english)

## 中文

这里存放产品页“一次真实运行”区块使用的截图。区块位于产品页“使用示例”一章（`#use-cases`）的示例列表下方，带有“真实截图”标签。产品内容在 `realRun.images[].file` 中引用截图，路径相对于本文件夹。构建时 Astro 会生成 640 和 1280 像素宽的 AVIF 与原格式图片，并保留原图供“查看原图”链接使用。录制方法和 `realRun` 各字段的说明见[内容维护](../../../docs/maintenance.zh.md#真实运行与截图)。

### 命名

```text
<产品 id>/<语言>-<序号>-<名称>.png
```

例如 `qcopilots-search/zh-1-pdf.png` 和 `qcopilots-search/en-1-pdf.png`。

- `<产品 id>` 与产品文件中的 `id` 相同。
- `<语言>` 为 `zh` 或 `en`。
- `<序号>` 从 1 开始，与 `realRun.images` 中的顺序一致。第 1 张大图显示，其余两张一行。
- `<名称>` 用小写英文和连字符，例如 `buffer-result`。

一次运行只录了一种语言时，两种语言共用同一组截图，文件名去掉语言前缀，写成 `<产品 id>/<序号>-<名称>.png`，例如 `qcopilots/1-map.png`。中英文两边的 `realRun.images` 引用同一个文件，`alt`、图片说明和 `prompts` 各自翻译，不另加“译文”标注。

### 格式与尺寸

- 只用 PNG 或 JPG（`.png`、`.jpg`、`.jpeg`，扩展名小写）。不要提交 WebP。
- 界面截图优先用 PNG。宽度最好不小于 1280 像素，保留完整窗口。
- 最好每种语言各录一次，图片数量相同、顺序一致，内容一一对应。只录了一次时按上面的方式共用。

### 提交前的隐私检查

逐张检查，确认画面中没有：

- 真实姓名、用户名、电脑名、邮箱或电话
- 用户文件夹和本地路径，例如 `C:\Users\...`、`AppData`
- 服务器地址、内网穿透地址、端口、密钥或令牌
- 通知弹窗、聊天窗口、任务栏或其他无关窗口
- 私人或客户的文件名、项目名和数据

截图保持原始分辨率，原样发布。确有隐私内容时才允许裁剪或遮盖，不修改运行结果。做过的处理写进 `realRun.note`。重新导出图片以去掉元数据。`realRun` 的文字同样不写这些内容，`site check` 会拦下其中常见的写法，例如 IP 地址、`localhost` 和 `C:\Users`。

### 记录

- 每张截图在[素材记录](../../../docs/assets.md#真实截图登记)中登记一行：文件、产品版本、录制日期、来源和隐私检查结果。截图中出现的样例文件要写明来源和许可。
- 这次运行和 `realRun` 中的每个数字与说法记录在[产品事实来源](../../../docs/product-evidence.md)中。

### 检查

- `site check`：文件存在、扩展名为 PNG 或 JPG、路径不跳出本文件夹，录制日期为 `YYYY-MM-DD` 且两种语言相同。
- `site run test:built`：截图由 Astro 生成，`alt` 和图片说明与内容一致，原图链接有效。
- 引用的文件不存在时，`site check` 和构建都会失败并给出文件名。

## English

This folder holds the screenshots for the “A real run” block on product pages. The block sits below the examples in the product page's examples chapter (`#use-cases`) and carries a “Real screenshots” label. Product content references the screenshots in `realRun.images[].file`, relative to this folder. At build time Astro generates 640 and 1280 pixel wide AVIF and original-format versions, and keeps the original for the “Open full size” link. How to record a run and what each `realRun` field means is in [Maintenance](../../../docs/maintenance.en.md#real-runs-and-screenshots).

### Naming

```text
<product-id>/<locale>-<n>-<name>.png
```

For example `qcopilots-search/zh-1-pdf.png` and `qcopilots-search/en-1-pdf.png`.

- `<product-id>` matches the `id` in the product file.
- `<locale>` is `zh` or `en`.
- `<n>` starts at 1 and follows the order in `realRun.images`. Image 1 is shown large, the rest two to a row.
- `<name>` is lowercase English with hyphens, for example `buffer-result`.

When a run was recorded in one language only, both languages share one set of screenshots, named without the locale prefix as `<product-id>/<n>-<name>.png`, for example `qcopilots/1-map.png`. `realRun.images` on both sides references the same file. The `alt` text, captions and `prompts` are translated for each language, with no “translated” label.

### Format and size

- PNG or JPG only (`.png`, `.jpg`, `.jpeg`, lowercase extension). Do not commit WebP.
- Prefer PNG for interface screenshots. Aim for at least 1280 pixels wide, showing the whole window.
- Ideally record once per language, so each locale has the same number of images, in the same order, showing matching moments. When the run was recorded only once, share the screenshots as described above.

### Privacy check before committing

Check every image and make sure it shows none of these:

- Real names, user names, computer names, email addresses or phone numbers
- User folders and local paths, such as `C:\Users\...` or `AppData`
- Server addresses, tunnel addresses, ports, keys or tokens
- Notifications, chat windows, the taskbar or other unrelated windows
- Private or customer file names, project names and data

Publish screenshots as captured, at full resolution. Crop or mask only when private details must be removed, and never change the result of the run. Describe any edits in `realRun.note`. Re-export the images to drop metadata. Keep the same details out of the `realRun` text too. `site check` blocks the common forms, such as IP addresses, `localhost` and `C:\Users`.

### Records

- Register every screenshot in the [Assets register](../../../docs/assets.md#real-screenshot-register): file, product version, recording date, source and privacy check. Name the source and license of any sample file that appears on screen.
- Record the run and every number and claim in `realRun` in the [product evidence](../../../docs/product-evidence.md).

### Checks

- `site check`: the file exists, the extension is PNG or JPG, the path stays inside this folder, and the recording date is `YYYY-MM-DD` and identical in both languages.
- `site run test:built`: screenshots come from Astro, `alt` text and captions match the content, and full-size links work.
- If a referenced file is missing, both `site check` and the build fail and name the file.
