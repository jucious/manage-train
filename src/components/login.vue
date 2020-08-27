<template>
  <div class="login-con">
      <div class="login_box">
            <!-- 头像区域 -->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <el-form class="login-form" :model="loginForm" :rules="rules" ref="loginForm">
                <el-form-item prop="name">
                    <el-input type="username"  prefix-icon="iconfont icon-user" v-model="loginForm.username"></el-input>
                </el-form-item>
                <el-form-item prop="pass">
                    <el-input type="password" prefix-icon="iconfont icon-3702mima" v-model="loginForm.password"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitForm('loginForm')">登录</el-button>
                    <el-button type="info" @click="resetForm('loginForm')">重置</el-button>
                </el-form-item>
            </el-form>
      </div>
  </div>
</template>

<script>
export default {
    name:'login',
    data(){
        return {
            loginForm:{
                username: 'admin',
                password:'123456'
            },
            rules:{
                username:[
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                password:[
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                ],
            }
        }
    },
    methods:{
        submitForm(formName) {
            this.$refs[formName].validate(async(valid) => {
                if(valid){
                   const {data:res} = await this.$http.post('login',this.loginForm);
                   if(res.meta.status==200){
                        this.$message({
                            message: res.meta.msg,
                            type: 'success'
                        });
                        window.sessionStorage.setItem('token',res.data.token)
                        this.$router.push('/home');
                   }else{
                       this.$message({
                            showClose: true,
                            message: res.meta.msg,
                            type: 'error'
                        });
                   }
                }
            })
        },
        resetForm(formName){
            this.$refs[formName].resetFields();
        }
    }
}
</script>

<style lang="less" scoped>
    .login-con{
        background-color:#2b4b6b;
        height: 100%;
    }
    .login_box {
        width: 450px;
        background-color: #fff;
        border-radius: 3px;
        position: absolute;
        padding:20px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        .avatar_box {
            height: 130px;
            width: 130px;
            border: 1px solid #eee;
            border-radius: 50%;
            padding: 10px;
            box-shadow: 0 0 10px #ddd;
            position: absolute;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #fff;
            img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #eee;
            }
        }
    }
    .login-form{
        margin-top: 90px;
    }
</style>