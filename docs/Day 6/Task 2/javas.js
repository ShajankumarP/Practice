const list = document.querySelector("ul");
const addButton = document.getElementById("submit");
const taskInput = document.getElementById("task-add");

function createTaskItem(taskText) {
    const li = document.createElement("li");
    const p = document.createElement("p");
    const checkBox = document.createElement("input");
    const deleteButton = document.createElement("button");

    checkBox.type = "checkbox";
    checkBox.addEventListener("change", () => {
        p.style.textDecoration = checkBox.checked ? "line-through" : "none";
    });

    p.textContent = taskText;


    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => li.remove());

    li.append(checkBox, p, deleteButton);

    return li;
}

addButton.addEventListener("click", () => {
    const taskText = taskInput.value.trim();
    if (taskText) {
        const newTask = createTaskItem(taskText);
        list.appendChild(newTask);
        taskInput.value = "";
    }
});