<template lang="pug">
.column.fit
  div(
    v-for="(b, bi) in blacklist" :key="bi"
    :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
    ).row.full-width.items-center.q-mb-sm.bg-white.cursor-pointer.q-px-sm
    div(:style=`{height: '40px', width: '40px'}`).row.items-center.justify-center
      //- subClick(s, si)
      img(@click="" :src="b.thumbUrl" :style=`{height: '40px', width: '40px', borderRadius: '50%'}`)
    div(@click="").col.full-height.q-ml-sm
      .row.fit.items-center
        span.text-caption {{ b.name | cut(50) }}
        //- small {{ s }}
    div(:style=`{}`).row.items-center.justify-center
      q-btn(icon="clear" round flat @click="userDelete()")
  div(style=`height: 100px`).row.full-width.justify-center.items-center
    span No one in your blacklist
</template>

<script>
export default {
  name: 'pageApp__Settings__Blacklist',
  data () {
    return {
      blacklist: [
        {}
      ]
    }
  },
  computed: {
    // blacklist () {
    //   return this.$store.state.
    // }
     blacklistCount () {
      return this.blacklist.length
    }
  },
  methods: {
    async userDelete (b, bi) {
      try {
        this.$logD('userDelete start')
        let res = await this.$store.dispatch('', b.oid)
        this.$logD('res', res)
        this.$delete(this.blacklist, bi)
        this.$logD('userDelete done')
      } catch (error) {
        this.$logD('userDelete error', error)
      }
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
