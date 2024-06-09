import axios from 'axios'
import router from '@/router'
import { reactive } from 'vue'


export default {
    state: () => ({
        members: [],
        host: process.env.VUE_APP_FASTAPI_BACKEND_URL,
    }),
    getters: {
        getMembers(state) {
            return state.members
        },
    },
    mutations: {
        setMembers(state, members) {
            members.forEach(member => {
                member.picture = state.host + member.picture
            })
            state.members = members
        },
        addMember(state, new_member) {
            state.members.push(new_member)
        },
        deleteMember(state, id_member) {
            state.members = state.members.filter(member => member.id_user != id_member)
        }
    },
    actions: {
        async fetchAllMembers(ctx, id_project) {
            try {
                const res = await axios.get(`/get_members/${id_project}`, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('token')
                    }
                })
                const members = res.data
                console.log(members)
                ctx.commit('setMembers', members)
            } catch(e) {
                localStorage.setItem('isAuthenticated', false)
                router.push('/')
            }
        },
        async addMember(ctx, data) {
            try {
                const res = await axios.post(`/add_member/${data.id_project}/${data.username}`, 'editor', {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('token')
                    }
                })
                const newMember = await res.data
                ctx.commit('addMember', newMember)
                if (res.status == 200){
                    let search = document.getElementById('search-project-member')
                    search.value = ''
                    search.style.border = '0.1rem solid #ccd1c5'
                }
            } catch(e) {
                // console.log(e)
                if (e.response.status == 400) {
                    console.log(400)
                    let search = document.getElementById('search-project-member')
                    search.style.border = '0.1rem solid red'
                }
            }
        },
        async deleteMember(ctx, data) {
            try {
                const res = await axios.delete(`/delete_member/${data.id_project}/${data.member.id_user}`, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('token')
                    }
                })
                ctx.commit('deleteMember', data.member.id_user)
                
            } catch(e) {
                alert('Нельзя удалить себя из своего проекта.')
            }
        }
    }
}