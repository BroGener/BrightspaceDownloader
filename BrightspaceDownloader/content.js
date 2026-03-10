console.log("🚀 Brightspace downloader loaded");

let currentDownloadInfo = null;
function getCourseInfo() {

    const downloadBtn = document.querySelector('button[id^="d2l_content_"]');
    let courseId, topicId;

    if (downloadBtn) {
        const parts = downloadBtn.id.split('_');
        courseId = parts[2];
        topicId = parts[3];
    } else {
        const match = window.location.href.match(/content\/(\d+)\/viewContent\/(\d+)/);
        if (match) {
            courseId = match[1];
            topicId = match[2];
        }
    }

    return { courseId, topicId };
}

function getCourseName() {
    return document
        .querySelector('div.d2l-navigation-s-title-container')
        ?.innerText.trim() || "Unknown_Course";
}

function getBreadcrumbs() {

    return Array.from(document.querySelectorAll('d2l-breadcrumb'))
        .map(host => host.shadowRoot?.querySelector('a')?.innerText.trim() || "")
        .filter(t => t !== "")
        .slice(1);

}


function getFileTitle() {
    return document.querySelector('h1.d2l-page-title')
        ?.innerText.trim() || "Document";
}

function buildDownloadUrl(courseId, topicId) {

    return `https://brightspace.algonquincollege.com/d2l/le/content/${courseId}/topics/files/download/${topicId}/DirectFileTopicDownload`;

}
function buildFileName() {

    const course = getCourseName();
    const breadcrumbs = getBreadcrumbs();
    const fileTitle = getFileTitle();

    const folderPath = breadcrumbs.join("_");

    const rawName = `${course} - ${folderPath} - ${fileTitle}`;

    return rawName.replace(/[\\/:*?"<>|]/g, "_");

}
async function getExtension(downloadUrl) {

    const res = await fetch(downloadUrl, {
        method: "HEAD",
        credentials: "include"
    });

    const cd = res.headers.get("content-disposition");

    if (cd) {
        const match = cd.match(/filename="(.+)"/);
        if (match) {
            const filename = match[1];
            return "." + filename.split(".").pop();
            //return match;
        }
    }

    return "";
}
function createButton() {

    if (document.getElementById("my-custom-btn")) return;

    const btn = document.createElement("button");

    btn.id = "my-custom-btn";
    btn.innerText = "一键分类下载";

    Object.assign(btn.style, {
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: "10000",
        padding: "12px 20px",
        backgroundColor: "#2ecc71",
        color: "white",
        fontWeight: "bold",
        border: "2px solid white",
        borderRadius: "8px",
        cursor: "pointer",
        boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
    });

    btn.onclick = () => {

        const { courseId, topicId } = getCourseInfo();

        const downloadUrl = buildDownloadUrl(courseId, topicId);
        const finalName = buildFileName();
        if (!downloadUrl) {
            alert("未能识别下载地址，请确保在课件预览页！");
            return;
        }

        const course = getCourseName();
        const breadcrumbs = getBreadcrumbs();
        const fileTitle = getFileTitle();
        //const ext =getExtension(downloadUrl);

        const fullPath = `${course}/${breadcrumbs.join('/')}/${fileTitle}`

        console.log("准备下载:", downloadUrl);
        console.log("目标路径:", fullPath);

        chrome.runtime.sendMessage({
            action: "startDownload",
            url: downloadUrl,
            path: fullPath
        });

    };

    document.body.appendChild(btn);




}

function init() {

    console.log("插件初始化");

    createButton();

}
setInterval(init, 5000);