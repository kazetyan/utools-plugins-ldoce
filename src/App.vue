<script setup lang="ts">
import Dictionary from './components/Dictionary.vue'
</script>

<template>
  <el-container>
    <el-header></el-header>
    <el-container>
<!--      <el-aside width="100px"></el-aside>-->
      <el-container>
        <el-main>
          <Dictionary/>
        </el-main>

      </el-container>
    </el-container>
    <el-footer></el-footer>
  </el-container>

</template>

<style scoped>
.el-container{
 height: 100%;
}
</style>
