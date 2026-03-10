console.log("Background downloader ready");

let pendingDownload = null;

chrome.runtime.onMessage.addListener((msg,sender, sendResponse) => {

    if (msg.action !== "startDownload") return;

    pendingDownload = {
        url: msg.url,
        path: msg.path
    };

    chrome.downloads.download({
        url: msg.url
    });
});


chrome.downloads.onDeterminingFilename.addListener(
    (item, suggest) => {

        if (!pendingDownload) return;

        if (!item.url.includes("DirectFileTopicDownload")) return;

        const ext =
            "." + item.filename.substring(item.filename.lastIndexOf("."));

        const finalPath = pendingDownload.path + ext;

        console.log("最终路径:", finalPath);

        suggest({
            filename: finalPath
        });

        pendingDownload = null;
    }
);