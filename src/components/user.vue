<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理1</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            class="input-with-select"
            clearable
            @clear="getUser"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUser"></el-button>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="dialogFormVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table :data="userlist" border style="width: 100%" class="user-tb">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state"  @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加新用户对话框 -->
    <el-dialog title="添加新用户" :visible.sync="dialogFormVisible" @close = "resetDialog('addFormRef')">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef">
        <el-form-item label="用户名"  prop="username">
          <el-input v-model="addForm.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机"  prop="mobile">
          <el-input v-model="addForm.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="resetDialog('editFormRef')">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
    </el-dialog>
     <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    var checkEmail = (rule,value,cb)=>{
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
        if(regEmail.test(value)){
            cb();
        }else{
            cb(new Error('请输入合法的邮箱'));
        }
    }
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^1[3456789]\d{9}$/

      if (regMobile.test(value)) {
        return cb()
      }

      cb(new Error('请输入合法的手机号'))
    }
    return {
        userlist: [],
        queryInfo: {
            query: "",
            pagenum: 1,
            pagesize: 5
        },
        addForm: {
            username: '',
            password: '',
            email: '',
            mobile: ''
        },
        total: 0,
        dialogFormVisible: false,
        editDialogVisible: false,
        setRoleDialogVisible:false,
        // 添加表单的验证规则对象
        addFormRules: {
            username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            {
                min: 3,
                max: 10,
                message: '用户名的长度在3~10个字符之间',
                trigger: 'blur'
            }
            ],
            password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            {
                min: 6,
                max: 15,
                message: '用户名的长度在6~15个字符之间',
                trigger: 'blur'
            }
            ],
            email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            { validator: checkEmail, trigger: 'blur' }
            ],
            mobile: [
            { required: true, message: '请输入手机号', trigger:'blur' },
            { validator: checkMobile, trigger: 'blur' }
            ]
        },
        editForm : {},
        // 修改表单的验证规则对象
        editFormRules: {
          email: [
            { required: true, message: '请输入用户邮箱', trigger: 'blur' },
            { validator: checkEmail, trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '请输入用户手机', trigger: 'blur' },
            { validator: checkMobile, trigger: 'blur' }
          ]
        },
        // 分配角色的数据
        userInfo:{},
        selectedRoleId:'',
        rolesList: []
    };
  },
  created() {
    this.getUser();
  },
  methods: {
    async getUser() {
      const { data: res } = await this.$http.get("/users", {
        params: this.queryInfo
      });
      if (res.meta.status == 200) {
        this.userlist = res.data.users;
        this.total = res.data.total;
      }
    },
    handleSizeChange(val) {
      this.queryInfo.pagesize = val;
      this.getUser();
    },
    async userStateChanged(userInfo){
        const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        if (res.meta.status !== 200) {
            userInfo.mg_state = !userInfo.mg_state
            return this.$message.error('更新用户状态失败！')
        }
    },
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val;
      this.getUser();
    },
    resetDialog(formName){
       this.$refs[formName].resetFields();
    },
    addUser(){
        this.$refs.addFormRef.validate(async valid => {
          if (valid) {
            const {data : res} = await this.$http.post("/users", this.addForm);
              if (res.meta.status !== 201) {
                this.$message.error('添加用户失败！')
              }this.$message.success('添加用户成功！')
              this.getUser();
              this.dialogFormVisible = false;
          }else{
            return false;
          }
        });
    },
    // 修改信息
    async showEditDialog(id){
      this.editDialogVisible = true;
      const { data : res } = await this.$http.get("users/"+id);
      this.editForm = res.data;
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败！')
      }
    },
    async editUserInfo(){
        this.$refs.editFormRef.validate(async valid => {
          if (valid) {
            const params = {email:this.editForm.email,mobile:this.editForm.mobile};
            console.log(params);
             const { data : res } = await this.$http.put("users/" + this.editForm.id,params);
              if (res.meta.status !== 200) {
                return this.$message.error('更新用户信息失败！')
              }
              this.editDialogVisible = false;
              this.getUser();
              this.$message.error('更新用户信息成功！')
          }else{
            return false;
          }
        })
    },
    // 删除
    removeUserById(id){
      this.$confirm('此操作将永久删除该用户, 是否继续?',
      '提示', {
        confirmButtonText:'确定',
        cancelButtonClass:'取消'
      }).then(async() => {
          const { data:res } = await this.$http.delete("users/" + id);
         if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败！')
        }
        this.$message.success('删除用户成功！');
        this.getUser();
      }).catch(()=>{
         this.$message({
            type: 'info',
            message: '已取消删除'
          });
      })
      
    },
    // 分配角色方法
    setRoleDialogClosed(){

    },
    async setRole(userInfo){
      this.setRoleDialogVisible = true;
      this.userInfo = userInfo;
      const {data:res} = await this.$http.get('roles');
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolesList = res.data;
    },
    async saveRoleInfo(){
      if(!this.selectedRoleId){
        return this.$message.error('请选择要分配的角色！')
      }
      const { data:res } = this.$http.put('users/'+this.userInfo.id+'/role',
      {
        rid : this.selectedRoleId 
      });
      console.log(res)
      if (res.meta.status !== 200) {
          return this.$message.error('更新角色失败！')
      }
        this.$message.success('更新角色成功！')
        this.getUserList()
        this.setRoleDialogVisible = false
      }
  }
};
</script>

<style lang="less" scoped>
</style>