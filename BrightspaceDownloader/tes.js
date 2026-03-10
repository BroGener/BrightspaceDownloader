console.log("🚀 Brightspace Downloader 已启动");

function init() {
    if (document.getElementById("smart-download-btn")) return;

    const btn = document.createElement("button");
    btn.id = "smart-download-btn";
    btn.innerText = "📁 一键分类下载";

    // 悬浮按钮样式
    Object.assign(btn.style, {
        position: "fixed", top: "80px", right: "30px", zIndex: "10000",
        padding: "12px 24px", backgroundColor: "#006fbf", color: "white",
        fontWeight: "bold", border: "2px solid white", borderRadius: "30px",
        cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
    });

    btn.onclick = () => {
        // 1. 获取 ID 信息（从按钮 ID 或 URL）
        const downloadBtn = document.querySelector('button[id^="d2l_content_"]');
        let courseId, topicId;

        if (downloadBtn) {
            const parts = downloadBtn.id.split('_');
            courseId = parts[2];
            topicId = parts[3];
        } else {
            const match = window.location.href.match(/content\/(\d+)\/viewContent\/(\d+)/);
            if (match) { courseId = match[1]; topicId = match[2]; }
        }

        if (!courseId || !topicId) {
            alert("❌ 无法识别课件 ID，请确保在课件预览页面");
            return;
        }

        // 2. 抓取结构信息
        const courseName = document.querySelector('.d2l-navigation-s-header-text')?.innerText.trim() || "UnknownCourse";

        // 处理 Shadow DOM 中的面包屑，去掉第一项
        const breadcrumbs = Array.from(document.querySelectorAll('d2l-breadcrumb'))
            .map(host => host.shadowRoot?.querySelector('a')?.innerText.trim() || "")
            .filter(t => t !== "").slice(1);

        const fileTitle = document.querySelector('h1.d2l-page-title')?.innerText.trim() || "Document";

        // 3. 拼接下载地址和文件路径
        const downloadUrl = `https://brightspace.algonquincollege.com/d2l/le/content/${courseId}/topics/files/download/${topicId}/DirectFileTopicDownload`;

        // 关键：filename 里的 "/" 会自动创建子文件夹
        const subPath = breadcrumbs.length > 0 ? breadcrumbs.join('/') + '/' : "";
        const finalPath = `${courseName}/${subPath}${fileTitle}.pdf`.replace(/[\\:*?"<>|]/g, "_");
        document.body.appendChild(btn);
        // 4. 发送给后台
        chrome.runtime.sendMessage({
            type: "EXECUTE_DOWNLOAD",
            url: downloadUrl,
            fileName: finalPath
        });

        btn.innerText = "⏳ 正在下载...";
        setTimeout(() => { btn.innerText = "📁 一键分类下载"; }, 3000);
    };

    document.body.appendChild(btn);
}

// 持续监测（应对单页应用切换）
setInterval(init, 2000);


// 获取你之前调优好的文件名（带层级路径）
    const course = document.querySelector('.d2l-navigation-s-header-text')?.innerText.trim() || "Course";
    const breadcrumbs = Array.from(document.querySelectorAll('d2l-breadcrumb'))
        .map(host => host.shadowRoot?.querySelector('a')?.innerText.trim() || "")
        .filter(t => t !== "").slice(1);
    
    const fileTitle = document.querySelector('h1.d2l-page-title')?.innerText.trim() || "Document";

    // 重点：在路径之间用 "/" 分隔，后台会自动创建文件夹
    // 最终格式：课程名/模块1/模块2/文件名.pdf
    const fullPath = `${course}/${breadcrumbs.join('/')}/${fileTitle}.pdf`
        .replace(/[\\:*?"<>|]/g, "_"); // 仅保留 / 作为路径分隔符

    chrome.runtime.sendMessage({
        type: "START_DOWNLOAD",
        url: downloadUrl,
        fileName: fullPath
    });
};