// 注意ElementId是不可改变的，每个引用这个js文件的页面都需要使用这几个元素id
const handle = document.getElementById('main-width-handler');
const box1 = document.getElementById('main-left-box');
const box2 = document.getElementById('main-right-box');
const boxcontainer = document.getElementById("main-box-container");

let isResizing = false;
handle.addEventListener('mousedown', (event) => {
    isResizing = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
    });
});
function handleMouseMove(event) {
    if (isResizing) {
        const containerRect = boxcontainer.getBoundingClientRect();
        const handlePosition = event.clientX - containerRect.left;
        box1.style.width = `${handlePosition}px`;
        box2.style.width = `${containerRect.width - handlePosition}px`;
    }
}