<template>
    <div class="project">
        <div class="project__control">
            <button class="project__create-project" type="button" @click="createTaskProj(id_project)">Создать задачу</button>
            <button class="project__create-project" type="button" @click="showDialog">Участники</button>
            <DialogView class="members" v-model:show="dialogVisible">
                <div class="members__search"  v-if="getCurrentUserRights.role=='owner'">
                    <input type="text" id="search-project-member" placeholder="Введите имя пользователя..." v-model="searchUsername">
                    <button type="button"@click="addMember({'id_project': id_project, 'username': searchUsername})">Добавить</button>
                </div>
                <div class="members__table">
                    <table>
                        <thead>
                            <tr>
                            <th>ID</th>
                            <th>Псевдоним</th>
                            <th v-if="getCurrentUserRights.role=='owner'">Действие</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="member in getMembers" :key="member.id_user">
                            <td class="limited" :title="member.searchname">{{ member.searchname }}</td>
                            <td class="limited" :title="member.full_name">{{ member.full_name }}</td>
                            <td v-if="getCurrentUserRights.role=='owner'"><button class="search__button" @click="deleteMember({'id_project': id_project, 'member': member})">Удалить</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </DialogView>
        </div>
        <div class="project__boards">
            <div class="project__board-switcher">
                <button type="button" @click="switchBoard('to-do')"><img id="switcher-to-do-icon" class="board-switcher__icon" src="@/assets/icons/project-tasks/to-do-active-section-icon.svg" alt=""></button>
                <button type="button" @click="switchBoard('in-progress')"><img id="switcher-in-progress-icon" class="board-switcher__icon" src="@/assets/icons/project-tasks/in-progress-section-icon.svg" alt=""></button>
                <button type="button" @click="switchBoard('done')"><img id="switcher-done-icon" class="board-switcher__icon" src="@/assets/icons/project-tasks/done-section-icon.svg" alt=""></button>
            </div>
            <div id="project__todo-board" class="project__task-board">
                <div class="title">Ожидают выполнения</div>
                <div v-for="taskProj in getTasksProj" :key="taskProj.id_task">
                    <div class="task-board__task" v-if="taskProj.category=='Надо сделать'">
                        <div class="task__control">
                            <input type="button" class="hidden"></input>
                            <button type="button" @click="deleteTaskProj({id_project, taskProj})"><img src="@/assets/icons/delete-task-proj-icon.webp" alt="" srcset=""></button>
                        </div>
                        <div class="task__picture-control">
                            <input class="task__picture-control-hidden" type="file" accept="image/*" :id="taskProj.id_task" @change="uploadTaskProjectPic({id_project, taskProj})">
                            <button type="button" class="upload-picture" @click="openFilePicker(taskProj.id_task)"><img src="@/assets/icons/upload-task-pic.webp"></button>
                            <button type="button" class="delete-picture" @click="deleteTaskProjectPic({id_project, taskProj})"><img src="@/assets/icons/delete-task-pic.webp"></button>
                        </div>
                        <div class="task__picture"><img v-if="!taskProj.picture.includes('/images/default/task_pic/task_pic.jpeg')" v-bind:src="taskProj.picture"></div>
                        <div class="task__title"><input class="task__title" type="text" v-model="taskProj.title" :title="taskProj.title" @change="updateTaskProj({id_project, taskProj})"></div>
                        <div class="task__description"><textarea v-model="taskProj.description" @change="updateTaskProj({id_project, taskProj})"></textarea></div>
                        <div class="task__control-category">
                            <div class="control__btn to-in-progress">
                                <img src="@/assets/icons/move-one-right-icon.svg" @click="changeTaskProjCategory({'id_project':id_project, 'taskProj': taskProj, 'category': 'В процессе'})" alt="">
                            </div>
                            <div class="control__btn to-done">
                                <img src="@/assets/icons/move-two-right-icon.svg" @click="changeTaskProjCategory({'id_project':id_project, 'taskProj': taskProj, 'category': 'Выполнено'})" alt="">
                            </div>
                        </div>
                        <div class="task__subtasks">
                            <div class="subtasks__open-list">
                                <input type="text" class="hidden">
                                <button class="subtasks__btn" type="button" @click="showSubtasks(taskProj.id_task)">
                                    Подзадачи: {{ taskProj.subtasks.length }}
                                    ({{ taskProj.subtasks.filter(s => s.done == true).length }}/{{ taskProj.subtasks.length }})
                                </button>
                            </div>
                            <div class="subtasks__list hidden" :id="`subtasks-${taskProj.id_task}`">
                                <div class="subtask" v-for="subtask in taskProj.subtasks" :key="subtask.id_subtask" >
                                    <label class="subtask__checkbox">
                                        <input class="subtask__real-checkbox" type="checkbox" v-model="subtask.done" @change="updateSubtaskProj(subtask)">
                                        <span class="subtask__custom-checkbox"></span>
                                    </label>
                                    <input class="subtask__text" type="text" v-model="subtask.description" :title="subtask.description">
                                    <button class="subtask__update" type="button" @click="updateSubtaskProj(subtask)"><img src="@/assets/icons/refresh-icon.webp" alt="Обновить"></button>
                                    <button class="subtask__delete" type="button" @click="deleteSubtaskProj(subtask)"><img src="@/assets/icons/delete-icon_2.webp" alt="Удалить"></button>
                                </div>
                                <div class="subtasks__add-todo">
                                    <button class="add-todo" type="button" @click="createSubtaskProj(taskProj)">
                                        <img src="@/assets/icons/plus-icon.webp" alt="Добавить">
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="project__in-progress-board" class="project__task-board">
                <div class="title">В процессе</div>
                <div v-for="taskProj in getTasksProj" :key="taskProj.id_task">
                    <div class="task-board__task" v-if="taskProj.category=='В процессе'">
                        <div class="task__control">
                            <input type="button" class="hidden"></input>
                            <button type="button" @click="deleteTaskProj({id_project, taskProj})"><img src="@/assets/icons/delete-task-proj-icon.webp" alt="" srcset=""></button>
                        </div>
                        <div class="task__picture-control">
                            <input class="task__picture-control-hidden" type="file" accept="image/*" :id="taskProj.id_task" @change="uploadTaskProjectPic({id_project, taskProj})">
                            <button type="button" class="upload-picture" @click="openFilePicker(taskProj.id_task)"><img src="@/assets/icons/upload-task-pic.webp"></button>
                            <button type="button" class="delete-picture" @click="deleteTaskProjectPic({id_project, taskProj})"><img src="@/assets/icons/delete-task-pic.webp"></button>
                        </div>
                        <div class="task__picture"><img v-if="!taskProj.picture.includes('/images/default/task_pic/task_pic.jpeg')" v-bind:src="taskProj.picture"></div>
                        <div class="task__title"><input class="task__title" type="text" v-model="taskProj.title" :title="taskProj.title" @change="updateTaskProj({id_project, taskProj})"></div>
                        <div class="task__description"><textarea v-model="taskProj.description" @change="updateTaskProj({id_project, taskProj})"></textarea></div>
                        <div class="task__control-category">
                            <div class="control__btn to-todo">
                                <img src="@/assets/icons/move-one-left-icon.svg" @click="changeTaskProjCategory({'id_project':id_project, 'taskProj': taskProj, 'category': 'Надо сделать'})" alt="">
                            </div>
                            <div class="control__btn to-done">
                                <img src="@/assets/icons/move-one-right-icon.svg" @click="changeTaskProjCategory({'id_project':id_project, 'taskProj': taskProj, 'category': 'Выполнено'})" alt="">
                            </div>
                        </div>
                        <div class="task__subtasks">
                            <div class="subtasks__open-list">
                                <input type="text" class="hidden">
                                <button class="subtasks__btn" type="button" @click="showSubtasks(taskProj.id_task)">
                                    Подзадачи: {{ taskProj.subtasks.length }}
                                    ({{ taskProj.subtasks.filter(s => s.done == true).length }}/{{ taskProj.subtasks.length }})
                                </button>
                            </div>
                            <div class="subtasks__list hidden" :id="`subtasks-${taskProj.id_task}`">
                                <div class="subtask" v-for="subtask in taskProj.subtasks" :key="subtask.id_subtask" >
                                    <label class="subtask__checkbox">
                                        <input class="subtask__real-checkbox" type="checkbox" v-model="subtask.done" @change="updateSubtaskProj(subtask)">
                                        <span class="subtask__custom-checkbox"></span>
                                    </label>
                                    <input class="subtask__text" type="text" v-model="subtask.description" :title="subtask.description">
                                    <button class="subtask__update" type="button" @click="updateSubtaskProj(subtask)"><img src="@/assets/icons/refresh-icon.webp" alt="Обновить"></button>
                                    <button class="subtask__delete" type="button" @click="deleteSubtaskProj(subtask)"><img src="@/assets/icons/delete-icon_2.webp" alt="Удалить"></button>
                                </div>
                                <div class="subtasks__add-todo">
                                    <button class="add-todo" type="button" @click="createSubtaskProj(taskProj)">
                                        <img src="@/assets/icons/plus-icon.webp" alt="Добавить">
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="project__done-board" class="project__task-board">
                <div class="title">Выполнены</div>
                <div v-for="taskProj in getTasksProj" :key="taskProj.id_task">
                    <div class="task-board__task" v-if="taskProj.category=='Выполнено'">
                        <div class="task__control">
                            <input type="button" class="hidden"></input>
                            <button type="button" @click="deleteTaskProj({id_project, taskProj})"><img src="@/assets/icons/delete-task-proj-icon.webp" alt="" srcset=""></button>
                        </div>
                        <div class="task__picture-control">
                            <input class="task__picture-control-hidden" type="file" accept="image/*" :id="taskProj.id_task" @change="uploadTaskProjectPic({id_project, taskProj})">
                            <button type="button" class="upload-picture" @click="openFilePicker(taskProj.id_task)"><img src="@/assets/icons/upload-task-pic.webp"></button>
                            <button type="button" class="delete-picture" @click="deleteTaskProjectPic({id_project, taskProj})"><img src="@/assets/icons/delete-task-pic.webp"></button>
                        </div>
                        <div class="task__picture"><img v-if="!taskProj.picture.includes('/images/default/task_pic/task_pic.jpeg')" v-bind:src="taskProj.picture"></div>
                        <div class="task__title"><input class="task__title" type="text" v-model="taskProj.title" :title="taskProj.title" @change="updateTaskProj({id_project, taskProj})"></div>
                        <div class="task__description"><textarea v-model="taskProj.description" @change="updateTaskProj({id_project, taskProj})"></textarea></div>
                        <div class="task__control-category">
                            <div class="control__btn to-todo">
                                <img src="@/assets/icons/move-two-left-icon.svg" @click="changeTaskProjCategory({'id_project':id_project, 'taskProj': taskProj, 'category': 'Надо сделать'})" alt="">
                            </div>
                            <div class="control__btn to-in-progress">
                                <img src="@/assets/icons/move-one-left-icon.svg" @click="changeTaskProjCategory({'id_project':id_project, 'taskProj': taskProj, 'category': 'В процессе'})" alt="">
                            </div>
                        </div>
                        <div class="task__subtasks">
                            <div class="subtasks__open-list">
                                <input type="text" class="hidden">
                                <button class="subtasks__btn" type="button" @click="showSubtasks(taskProj.id_task)">
                                    Подзадачи: {{ taskProj.subtasks.length }}
                                    ({{ taskProj.subtasks.filter(s => s.done == true).length }}/{{ taskProj.subtasks.length }})
                                </button>
                            </div>
                            <div class="subtasks__list hidden" :id="`subtasks-${taskProj.id_task}`">
                                <div class="subtask" v-for="subtask in taskProj.subtasks" :key="subtask.id_subtask" >
                                    <label class="subtask__checkbox">
                                        <input class="subtask__real-checkbox" type="checkbox" v-model="subtask.done" @change="updateSubtaskProj(subtask)">
                                        <span class="subtask__custom-checkbox"></span>
                                    </label>
                                    <input class="subtask__text" type="text" v-model="subtask.description" :title="subtask.description">
                                    <button class="subtask__update" type="button" @click="updateSubtaskProj(subtask)"><img src="@/assets/icons/refresh-icon.webp" alt="Обновить"></button>
                                    <button class="subtask__delete" type="button" @click="deleteSubtaskProj(subtask)"><img src="@/assets/icons/delete-icon_2.webp" alt="Удалить"></button>
                                </div>
                                <div class="subtasks__add-todo">
                                    <button class="add-todo" type="button" @click="createSubtaskProj(taskProj)">
                                        <img src="@/assets/icons/plus-icon.webp" alt="Добавить">
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex';
export default {
    name: 'ProjectView',
    data: () => ({
        id_project: '',
        searchUsername: '',
        dialogVisible: false
    }),
    computed: {
        ...mapGetters(['getTasksProj', 'getAuth', 'getCurrentUserRights', 'getMembers']),
    },
    methods: {
        ...mapMutations(['setIdProject']),
        ...mapActions(['checkAuth', 'fetchCurrentUser', 'fetchCurrentUserRights', 'fetchAllMembers', 'addMember', 'deleteMember', 'fetchAllTasksProj', 'createTaskProj', 'updateTaskProj', 'deleteTaskProj', 'uploadTaskProjectPic', 'deleteTaskProjectPic', 'changeTaskProjCategory', 'createSubtaskProj', 'updateSubtaskProj', 'deleteSubtaskProj']),
        showDialog() {
            this.dialogVisible = true;
        },
        openFilePicker(id_filePicker){
            let filePicker = document.getElementById(`${id_filePicker}`)
            filePicker.click()
        },
        showSubtasks(id_task) {
            let list = document.getElementById(`subtasks-${id_task}`)
            list.classList.toggle('hidden')
        },
        switchBoard(board) {
            let toDoBoard = document.getElementById('project__todo-board')
            let toDoIcon = document.getElementById('switcher-to-do-icon')

            let inProgressBoard = document.getElementById('project__in-progress-board')
            let inProgress = document.getElementById('switcher-in-progress-icon')

            let doneBoard = document.getElementById('project__done-board')
            let doneIcon = document.getElementById('switcher-done-icon')

            if (board == 'to-do') {
                toDoBoard.style.display = 'block'
                toDoIcon.src  = require('@/assets/icons/project-tasks/to-do-active-section-icon.svg')

                inProgressBoard.style.display = 'none'
                inProgress.src = require('@/assets/icons/project-tasks/in-progress-section-icon.svg')

                doneBoard.style.display = 'none'
                doneIcon.src = require('@/assets/icons/project-tasks/done-section-icon.svg')
            }
            if (board == 'in-progress') {
                toDoBoard.style.display = 'none'
                toDoIcon.src  = require('@/assets/icons/project-tasks/to-do-section-icon.svg')

                inProgressBoard.style.display = 'block'
                inProgress.src = require('@/assets/icons/project-tasks/in-progress-active-section-icon.svg')

                doneBoard.style.display = 'none'
                doneIcon.src = require('@/assets/icons/project-tasks/done-section-icon.svg')
            }
            if (board == 'done') {
                toDoBoard.style.display = 'none'
                toDoIcon.src  = require('@/assets/icons/project-tasks/to-do-section-icon.svg')

                inProgress.src = require('@/assets/icons/project-tasks/in-progress-section-icon.svg')
                inProgressBoard.style.display = 'none'

                doneBoard.style.display = 'block'
                doneIcon.src = require('@/assets/icons/project-tasks/done-active-section-icon.svg')
            }
        },
    },
    created() {
        this.checkAuth()
        this.id_project = this.$route.params.id_project
    },
    mounted() {
        this.fetchCurrentUser()
        this.fetchCurrentUserRights(this.id_project)
        this.fetchAllMembers(this.id_project)
        this.fetchAllTasksProj(this.$route.params.id_project)
        // this.setIdProject(this.$route.params.id_project)
    },
}
</script>

<style>
.project {
    height: fit-content;   
}

.project__create-project {
    font-size: 1.6rem;
    padding: 1.5rem;
    border: none;
    background-color: #379683;
    color: #8EE4AF;
    border-radius: 4rem;
    margin: 1rem auto;
    margin-bottom: 0;
    margin-left: 1rem;
}

.project__create-project:hover {
    background-color: #318675;
}

.members__search {
    display: flex;
    justify-content: center;
    align-items: center;
}

.members__search {
    padding: 1rem;
    padding-left: 0;
    padding-right: 0;
}

.members__search input {
    width: 80%;
    margin-right: 2rem;
    font-size: 1.6rem;
    background-color: #E6ECDC;
    border: none;
    border-radius: 1.2rem;
    padding: 1rem;
}

.members__search input:focus {
    outline: 0.2rem solid #ccd1c5;
}

.members__search button {
    padding: 0.8rem;
    font-size: 1.2rem;
    background-color: #e6ecdc;
    border: 0.1rem solid #ccd1c5;
    border-radius: 1.2rem;
}

.members__search button:hover {
    background-color: #ccd1c5;
}

.members__table {
    margin-left: 1rem;
    margin-bottom: 1rem;
    padding-left: 1rem;
    width: 90%;
}

.members__table table, th, td {
    text-align: center;
    border: 0.1rem solid #ccd1c5;
    border-collapse: collapse;
}

.members__table th {
    width: 100%;
    padding: 1rem;
    font-size: 1.4rem;
}

.members__table td {
    font-size: 1.2rem;
    padding: 1rem;
}

.search__button {
    padding: 0.8rem;
    font-size: 1.2rem;
    background-color: #e6ecdc;
    border: 0.1rem solid #ccd1c5;
    border-radius: 1.2rem;
}

.search__button:hover {
    background-color: #ccd1c5;
}

.project__boards {
    display: flex;
    justify-content: space-between;
    margin-top: 4rem;
    /* margin-bottom: 4rem; */
    margin-right: 4rem;
}

.project__board-switcher {
    display: none;
}

.project__board-switcher button {
    padding: 1rem;
    border: none;
    background-color: rgba(0, 0, 0, 0);
}

.board-switcher__icon {
    display: block;
    padding: 0;
    width: 6.4rem;
}

.title {
    width: 100%;
    font-size: 2.4rem;
    padding-top: 1rem;
    padding-bottom: 1rem;
    color: #8EE4AF;
    background-color: #379683;
    text-align: center;
}

.project__task-board {
    position: relative;  /* mvp */
    background-color: #8EE4AF;
    width: 30%;
    height: 89vh;
    overflow: scroll;
    scroll-behavior: smooth;
    scrollbar-width: thin;
    border-radius: 0.6rem;
}

.task-board__task {
    /* height: 10%; */
    background-color: #EDF5E1;
    margin-top: 1rem;
    border-radius: 1rem;
    /* padding-left: 0.5rem;
    padding-right: 0.5rem; */
}

.task-board__task:hover {
    outline: 0.4rem solid #963737;
}

.task__control {
    display: flex;
    justify-content: space-between;
    padding: 0.6rem;
}

.task__control > button{
    background-color: #EDF5E1;
    border: none;
}

.task__control > button:hover{
    background-color: #ffd8d8;
}

.task__control  img{
    display: block;
    padding: 0.2rem;   
}

.task__picture-control {
    display: flex;
    justify-content: space-between;
    padding: 0.4rem;
}

.task__picture-control > button{
    background-color: #EDF5E1;
    border: none;
}

.task__picture-control > button:hover{
    background-color: #ccd3c2;
    border: none;
}

.task__picture-control .delete-picture:hover {
    background-color: #ffd8d8;
}

.upload-picture > img{
    display: block;
    padding: auto;
}

.delete-picture > img{
    display: block;
    padding: auto;
}

.task__picture-control-hidden {
    opacity: 0;
    height: 0;
    width: 0;
    line-height: 0;
    overflow: hidden;
    padding: 0;
    margin: 0;
    position: absolute;
    z-index: -1;
}

.task__subtasks {
    padding: 0.5rem;
}

.task__picture {
    display: block;
    margin-left: auto;
    margin-right: auto;
    padding-top: 1rem;
    /* width: fit-content; */
    width: 90%;
    /* border: 1.1rem solid #ccd1c5; */
}

.task__picture img {
    display: block;
    width: 90%;
    margin-left: auto;
    margin-right: auto;
    object-fit: contain;
    border-radius: 1rem;
}

.task__title {
    text-align: center;
    font-size: 1.8rem;
    font-weight: 500;
    padding-top: 1rem;
    margin-bottom: 1rem;
}

.task__title input{
    background-color: #E6ECDC;
    border: none;
    width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
}

.task__title input:focus {
    outline: 0.2rem solid #ccd1c5;
}

.task__description {
    display: block;
    padding-left: 0.8rem;
    padding-right: 0.8rem;
    text-align: justify;
/*     overflow: scroll; */
    height: 2rem;
    font-size: 1.4rem;
    height: 20%;
}

.task__description textarea {
    padding: 1rem;
    resize: none;
    width: 100%;
    height: 10rem;
    font-size: 1.4rem;
    text-align: justify;
    line-height: 2.0rem;
    overflow-x: hidden;
    background-color: #E6ECDC;
    border: 0.1rem solid #ccd1c5;
    border-radius: 1rem;
}

.task__description textarea:focus {
    outline: 0.2rem solid #ccd1c5;
}

.task__control-category {
    display: flex;
    justify-content: space-around;
    width: 30%;
    margin: 1rem auto;
    padding-bottom: 1rem;
}

.to-todo img {
    display: block;
    padding: auto;
}

.to-in-progress img {
    display: block;
    padding: auto;
}

.to-done img {
    display: block;
    padding: auto;
}

.to-todo:hover {
    background-color: #ccd1c5;
    border-radius: 50%;
    width: fit-content;
    height: fit-content;
}

.to-in-progress:hover{
    background-color: #ccd1c5;
    border-radius: 50%;
    width: fit-content;
    height: fit-content;
}

.to-done:hover {
    background-color: #ccd1c5;
    border-radius: 50%;
    width: fit-content;
    height: fit-content;
}

.hidden {
    opacity: 0;
    height: 0;
    width: 0;
    line-height: 0;
    overflow: hidden;
    padding: 0;
    margin: 0;
}

.subtask {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    align-items: center;
    /* padding: 1rem; */
}

.subtasks__btn {
    background-color: #E6ECDC;
    border: 0.1rem solid #ccd1c5;
    border-radius: 0.8rem;
    padding: 1rem;
    font-size: 1.2rem;
}

.subtasks__btn:hover {
    background-color: #ccd1c5;
    content: attr('qweqw');
}

.subtasks__list {
    padding: 1rem;
}

.subtask__checkbox {
    padding-right: 1rem;
}

.subtask__real-checkbox {
    width: 0;
    height: 0;
    opacity: 0;
    position: absolute;
    z-index: -1;
}

.subtask__custom-checkbox {
    position: relative;
    display: inline-block;
    width: 3.2rem;
    height: 3.2rem;
    background-color: #fff;
    border: 0.1rem solid #000;
}

.subtask__custom-checkbox::before {
    content: '';
    display: inline-block;
    width: 1.3rem;
    height: 1.3rem;
    background-image: url('@/assets/icons/complete-icon.svg');
    background-size: contain;
    background-repeat: no-repeat;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) scale(0);
    margin-top: 0.1rem;

    transition: 0.2s ease-in;
}

.subtask__real-checkbox:checked + .subtask__custom-checkbox::before {
    transform: translate(-50%, -50%) scale(2);
    background-color: #C0F9A5;
}

.subtask__real-checkbox:checked + .subtask__custom-checkbox {
    background-color: #C0F9A5;
}

.subtask__text {
    width: 75%;
    border-radius: 0.5rem;
    outline: none;
    border: 0.1rem solid #000;
    padding: 1rem;
    font-size: 1.6rem;
}

.subtask__update {
    background-color: #90F95E;
    border: none;
    padding: 0.1rem;
}

.subtask__update:hover {
    background-color: #82e455;
}

.subtask__update img{
    display: block;
    padding: auto;
}

.subtask__delete {
    background-color: #FD7070;
    border: none;
    padding: 0.1rem;
}

.subtask__delete:hover {
    background-color: #e66767;
}

.subtask__delete img{
    display: block;
    padding: auto;
}

.add-todo {
    background-color: #5DE192;
    border: none;
    border-radius: 1rem;
    padding: 0.2rem;
}

.add-todo:hover {
    background-color: #51c47f;
}

.add-todo img{
    display: block;
    padding: auto;
}

.limited {
    max-width: 100rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

@media (max-width: 1600px) {
    .limited {
        max-width: 90rem;
    }

    .project__control {
        margin-left: 8rem;
    }

    .project__boards {
        display: flex;
        margin-left: 9rem;
    }
}

@media (max-width: 1280px) {
    .project__control {
        margin-left: 7rem;
    }

    .limited {
        max-width: 15rem;
    }

    .project__boards {
        flex-direction: column;
        margin-left: 0;
        margin-right: 0;
    }

    .project__board-switcher {
        display: flex;
        justify-content: space-between;
        margin: 1rem auto;
        position: sticky;
        top: 0.5rem;
        z-index: 99;
        width: 16rem;
        width: fit-content;
        border: none;
    }

    .project__task-board {
        width: 70rem;
        margin: auto;
    }

    #project__in-progress-board {
        display: none;
    }

    #project__done-board {
        display: none;
    }
}

@media (max-width: 1024px) {
    .project__boards {
        flex-direction: column;
        margin-left: 0;
        margin-right: 0;
    }

    .project__board-switcher {
        display: flex;
        justify-content: space-between;
        margin: 1rem auto;
        position: sticky;
        top: 0.5rem;
        z-index: 99;
        width: 16rem;
        width: fit-content;
        border: none;
    }

    .project__task-board {
        width: 50rem;
        margin: auto;
    }

    #project__in-progress-board {
        display: none;
    }

    #project__done-board {
        display: none;
    }
}

@media (max-width: 768px) {
    .members__table {
        margin-left: 0;
        margin-right: 0;
        padding-left: 0;
    }

    .project__control {
        margin-left: 0;
    }

    .project__boards {
        flex-direction: column;
        margin-left: 0;
        margin-right: 0;
    }

    .project__board-switcher {
        display: flex;
        justify-content: space-between;
        margin: 1rem auto;
        position: sticky;
        top: 0.5rem;
        z-index: 99;
        width: 16rem;
        width: fit-content;
        border: none;
    }

    .project__task-board {
        width: 95%;
        margin: auto;
    }

    #project__in-progress-board {
        display: none;
    }

    #project__done-board {
        display: none;
    }
}
</style>
