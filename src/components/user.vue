<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理1</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容w"
            v-model="queryInfo.query"
            class="input-with-select"
            clearable
            @clear="getUser"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUser"></el-button>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="dialogTableVisible = true">添加用户</el-button>
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
          <template>
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 3, 4]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
      <!-- 添加新用户对话框 -->
      <el-dialog title="添加新用户" :visible.sync="dialogTableVisible">
        <el-form :model="addForm" :rules="addFormRules">
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
            <el-input v-model="addForm.role" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogTableVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogTableVisible = false">确 定</el-button>
        </div>
      </el-dialog>
    </el-card>
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
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

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
            pagesize: 2
        },
        addForm: {
            username: '',
            password: '',
            email: '',
            mobile: ''
        },
        total: 0,
        dialogTableVisible: false,
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
            { required: true, message: '请输入手机号', trigger: 'blur' },
            { validator: checkMobile, trigger: 'blur' }
            ]
        }
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
    }
  }
};
</script>

<style lang="less" scoped>
</style>