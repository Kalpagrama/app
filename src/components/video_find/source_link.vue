<template lang="pug">
.row.fit
  div(style=`height: 300px`).row.full-width.items-center.content-center.q-px-sm
    .col
      q-input(v-model="link" filled :label="$t('paste_link_here')" :loading="loading" @keyup.enter="startSearch()").full-
        template(v-slot:append)
          q-btn(v-if="!loading" round flat dense icon="clear" @click="link = ''")
    q-btn(style=`height: 56px` color="primary" @click="startSearch()" :loading="loading").q-ml-sm {{$t('find')}}
  //- iframe(
  //-   v-if="type === 'youtube'"
  //-   width="100%" height="100%"
  //-   :src="getLink"
  //-   frameborder="0"
  //-   autoplay
  //-   allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
  //-   allowfullscreen)
</template>

<script>
export default {
  name: 'videoFind__sourceLink',
  data () {
    return {
      link: '',
      loading: false
    }
  },
  methods: {
    async startSearch () {
      try {
        this.loading = true
        await this.$wait(1000)
        await this.linkValidate()
        this.loading = false
      } catch (error) {
        this.loading = false
      }
      this.$log('startSearch')
    },
    linkValidate () {
      this.$log('linkValidate')
    }
  },
  computed: {
    // getLink () {
    //   let id = ''
    //   let arr = this.link.split('/')
    //   if (arr[arr.length - 2] === 'embed') {
    //     id = arr[arr.length - 1]
    //   } else {
    //     let s = this.link.split('=')
    //     id = s[1]
    //   }
    //   return `https://www.youtube.com/embed/${id}`
    // }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
