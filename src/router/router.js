import Vue from 'vue'
import login from '../components/login'
import home from '../components/home'
import welcome from '../components/welcome'
import user from '../components/user'
import VueRouter from 'vue-router'
Vue.use(VueRouter)
const routes = [
    {path:'/login',component:login},
    {path:'/',redirect:'/login'},
    {
        path:'/home',
        component:home,
        redirect:'/welcome',
        children:[
            {path:'/welcome',component:welcome},
            {path:'/users',component:user}
        ]
    },
]
const router = new VueRouter({routes})
router.beforeEach((to,from,next)=>{
    let token = window.sessionStorage.getItem('token');
    if(to.path=="/login") return next();
    if(!token) return next('/login')
    next()

})
export default router