<template lang="pug">
.column.fit
  .col.fit.bg-grey-3.q-px-sm.q-py-sm
    div(
      @click="subjectClick(s, ss)"
      v-for="(s, ss) in subscribers" :key="ss"
      :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
      ).row.full-width.items-center.q-mb-sm.bg-white.cursor-pointer.q-px-sm
      div(:style=`{height: '40px', width: '40px'}`).row.items-center.justify-center
        img(:src="s.thumbUrl" :style=`{height: '40px', width: '40px', borderRadius: '50%'}`)
      .col.full-height.q-ml-sm
        .row.fit.items-center
          span.text-caption {{ s.name | cut(50) }}
    div(v-if="countSubs === 0").row.full-width
      div(style=`border-radius: 10px`).row.full-width.justify-center.items-center.bg-grey-1.q-pa-lg
        span.text-bold No followers
</template>
<script>
export default {
  name: 'user__following',
  props: ['subscribers', 'oid'],
  data () {
    return {
    }
  },
  computed: {
    countSubs () {
      if (this.subscribers === null) return 0
      return this.subscribers.length
    }
  },
  methods: {
    subjectClick (s) {
      this.$logD('subjectClick')
      switch (s.type) {
        case 'VIDEO':
        case 'AUDIO':
        case 'BOOK':
        case 'IMAGE': {
          this.$router.push(`/content/${s.oid}`)
          break
        }
        case 'USER': {
          if (this.oid === s.oid) break
          else this.$router.push(`/user/${s.oid}`)
          this.$log('!!!', this.path)
          break
        }
        case 'SPHERE': {
          this.$router.push(`/sphere/${s.oid}`)
          break
        }
        case 'NODE': {
          this.$router.push(`/node/${s.oid}`)
          break
        }
      }
    }
  }
}
</script>
