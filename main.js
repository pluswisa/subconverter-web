const BACKEND = "http://cf-subweb-subconverter.airport.kdns.fr";

async function convertSub() {
    const url = document.getElementById("url").value.trim();
    const target = document.getElementById("target").value;
    const result = document.getElementById("result");

    if (!url) {
        alert("请输入订阅链接");
        return;
    }

    const api =
        `${BACKEND}/sub?target=${encodeURIComponent(target)}&url=${encodeURIComponent(url)}`;

    result.value = "Converting...";

    try {
        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 60000);

        const res = await fetch(api, {
            method: "GET",
            signal: controller.signal,
            headers: {
                "Accept": "*/*"
            }
        });

        clearTimeout(timeout);

        const text = await res.text();

        if (!res.ok) {
            result.value =
`HTTP ${res.status}

${text || "后端未返回错误内容"}`;
            return;
        }

        if (!text || text.trim() === "") {
            result.value =
`转换完成

但是后端返回为空。

可能原因：

1. 订阅链接无效
2. 订阅内容为空
3. 节点格式不支持
4. 后端配置异常`;
            return;
        }

        result.value = text;

    } catch (err) {

        if (err.name === "AbortError") {
            result.value =
`转换超时（60秒）

请检查：

1. 订阅链接是否有效
2. OpenWrt是否能访问订阅服务器
3. 节点数量是否过多
4. 后端日志是否报错`;
            return;
        }

        result.value =
`请求失败

${err}`;
    }
}

async function copyText() {
    const text = document.getElementById("result").value;

    if (!text) {
        alert("没有可复制内容");
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        alert("复制成功");
    } catch (e) {
        alert("复制失败");
    }
}

function downloadFile() {
    const text = document.getElementById("result").value;

    if (!text) {
        alert("没有可下载内容");
        return;
    }

    const blob = new Blob(
        [text],
        {
            type: "text/plain;charset=utf-8"
        }
    );

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download =
        document.getElementById("target").value === "clash"
            ? "config.yaml"
            : "subscription.txt";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
}