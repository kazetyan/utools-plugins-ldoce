<template>
  <div>
    <div class="main_panel">
      <div class="query_area">
        <el-row>
          <el-col :span="10">
            <el-input
                v-model="inputWord"
                clearable
                style="width: 100%"
                @keyup.enter="queryWord"
                placeholder="请输入要查的单词"
            />
          </el-col>
          <el-col :span="2"></el-col>
          <el-col :span="6">
            <el-button @click="queryWord" type="primary">查询</el-button>
          </el-col>
          <el-col :span="6"></el-col>
        </el-row>
      </div>
      <el-divider content-position="left">查询结果</el-divider>
      <div class="data_area" v-loading="loading">
        <el-descriptions
            class="margin-top"
            :column="2"
            border
        >
          <el-descriptions-item label-class-name="desc-item-lable" label="音标" label-align="center">
            {{ resWord.phonetic }}
          </el-descriptions-item>
          <!--          <el-descriptions-item label-class-name="desc-item-lable" label="单词">-->
          <!--            {{ resWord.hwd }}-->
          <!--          </el-descriptions-item>-->
          <el-descriptions-item label-class-name="desc-item-lable" label="断字" label-align="center">
            {{ resWord.hyphenation }}
          </el-descriptions-item>
          <el-descriptions-item label-class-name="desc-item-lable" label="词性" label-align="center">
            {{ resWord.pos }}
          </el-descriptions-item>
          <el-descriptions-item label-class-name="desc-item-lable" label="语法" label-align="center">
            {{ resWord.gram }}
          </el-descriptions-item>
          <el-descriptions-item label-class-name="desc-item-lable" label="英音" label-align="center">
            <el-icon @click="playBreVideo()">
              <VideoPlay/>
              <audio ref="breAudio" :src="resWord.brePron" hidden></audio>
            </el-icon>
          </el-descriptions-item>
          <el-descriptions-item label-class-name="desc-item-lable" label="美音" label-align="center">
            <el-icon @click="playAmeVideo()">
              <VideoPlay/>
              <audio ref="ameAudio" :src="resWord.amePron" hidden></audio>
            </el-icon>
          </el-descriptions-item>
          <template v-for="(explain,index) in resWord.explainList">
            <el-descriptions-item label-class-name="desc-item-lable" :label="`释义${index+1}`" :span="2"
                                  label-align="center">
              {{ explain }}
            </el-descriptions-item>
          </template>
        </el-descriptions>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import {ref} from "vue";
import {ElMessage} from 'element-plus'
import {get} from '../util/axios'
import cheerio, {Element, Cheerio} from 'cheerio'

if (utools) {
  utools.onPluginEnter(({code, type, payload, option}) => {
    // payload是输入文本
    console.log('用户进入插件应用', code, type, payload)
    inputWord.value = payload;
    queryWord();
  })
}

const inputWord = ref('');

const resWord = ref(
    {
      phonetic: '',
      hwd: '',
      hyphenation: '',
      pos: '',
      gram: '',
      explainList: [],
      brePron: '',
      amePron: '',
    }
);

const inputReg = new RegExp(/^[a-zA-Z-]*$/)

const loading = ref(false);

const queryWord = () => {
  if (!inputWord.value || !inputReg.test(inputWord.value)) {
    ElMessage.error('输入不合法,请输入正确的单词!');
    return;
  }
  loading.value = true;
  get(`https://www.ldoceonline.com/dictionary/${inputWord.value}`).then(res => {
    console.log(res.status);
    console.log(res)
    const $ = cheerio.load(res.data);
    const dict = $('div.entry_content > div.dictionary' as string).first();
    console.log(dict);
    if (dict.length === 0) {
      // 没查到单词
      const didyoumean = dict.find($('ul.didyoumean' as string) as Cheerio<Element>).first();
      console.log(didyoumean)
      // const temp = didyoumean.toArray().map(item=>item.find($('ri')))
      // console.log(temp);
      ElMessage.warning('没查到单词!')
    } else {
      // 查到了
      const phonetic = dict.find($('span.PronCodes' as string) as Cheerio<Element>).first().text();

      const hwd = dict.find($('span.HWD' as string) as Cheerio<Element>).first().text();

      const hyphenation = dict.find($('span.HYPHENATION' as string) as Cheerio<Element>).first().text();

      const pos = dict.find($('span.POS' as string) as Cheerio<Element>).first().text();

      const gram = dict.find($('span.GRAM' as string) as Cheerio<Element>).first().text();

      const explainList = (dict.find($('span.Sense' as string) as Cheerio<Element>).map((i, el) => {
        return $(el).find($('span.DEF' as string) as Cheerio<Element>).text();
      }).get() as Array<string>).filter(str => str.length > 0);

      const brePron = dict.find($('span.brefile' as string) as Cheerio<Element>).first().attr('data-src-mp3');

      const amePron = dict.find($('span.amefile' as string) as Cheerio<Element>).first().attr('data-src-mp3');

      resWord.value = {
        phonetic,
        hwd,
        hyphenation,
        pos,
        gram,
        explainList,
        brePron,
        amePron,
      }
    }
  }).catch(err => {
    ElMessage.error('查询出错,请稍后重试!')
    console.log('occur error', err)
  }).finally(() => {
    loading.value = false;
  })
}
const breAudio = ref<HTMLAudioElement>();
const ameAudio = ref<HTMLAudioElement>();

const playBreVideo = () => {
  (breAudio.value as HTMLAudioElement).play();
}

const playAmeVideo = () => {
  (ameAudio.value as HTMLAudioElement).play();
}
</script>

<style>
.main_panel {
  width: 70%;
  padding: 0 15%;
}

.desc-item-lable {
  text-align: center;
  width: 80px;
  min-width: 70px;
}
</style>