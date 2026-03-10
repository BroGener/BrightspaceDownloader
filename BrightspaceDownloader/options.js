const pathTemplate = document.getElementById("pathTemplate")
const courseSplit = document.getElementById("courseSplit")
const courseIndex = document.getElementById("courseIndex")

const status = document.getElementById("status")

// 读取配置
chrome.storage.sync.get(
[
"pathTemplate",
"courseSplit",
"courseIndex"
],
(cfg)=>{

pathTemplate.value = cfg.pathTemplate || "{course}/{crumbs}/{title}"
courseSplit.value = cfg.courseSplit || "_"
courseIndex.value = cfg.courseIndex ?? 0

}
)


// 保存配置
document.getElementById("save").onclick=()=>{

chrome.storage.sync.set({

pathTemplate:pathTemplate.value,
courseSplit:courseSplit.value,
courseIndex:Number(courseIndex.value)

},()=>{

status.textContent="Saved!"

setTimeout(()=>status.textContent="",2000)

})

}