<template lang="pug">
q-layout(container :style=`{width: width+'px', height: height+'px'}`).column.bg-grey-3
  q-dialog(ref="subDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down"
    @hide="sub = null")
    div(@click.self="$refs.subDialog.hide()").row.fit.justify-center.items-start.q-py-xl.q-px-sm
      div(:style=`{maxWidth: '500px', borderRadius: '10px', overflow: 'hidden'}`).column.fit.bg-white
        .col.full-width.scroll
          .row.full-width.items-start.content-start.q-pa-md
            span {{ sub }}
  q-header(reveal)
    div(:style=`{height: '60px'}`).row.full-width.bg-white
      .col.full-height
        .row.fit.items-center.q-px-md
          span.text-bold.text-black Подписки
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
        q-btn(round flat icon="edit" color="green" @click="editToggle()")
  q-page-container.fit
    q-page.fit
      .row.full-width.items-start.content-start.justify-center.q-pa-md
        div(:style=`{maxWidth: '500px'}`).row.full-width
          div(
            v-for="(s, si) in subscriptions" :key="si"
            :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.items-center.q-mb-sm.bg-white.cursor-pointer
            div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
              img(@click="subClick(s, si)" :src="s.thumbUrl" :style=`{height: '40px', width: '40px', borderRadius: '50%'}`)
            div(@click="subClick(s, si)").col.full-height
              .row.fit.items-center
                span {{ s.name | cut(50) }}
            div(v-if="editing" :style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
              q-btn(round flat icon="delete_outline" color="grey-7" @click="subDelete(s, si)")
</template>

<script>
export default {
  name: 'pageApp__subscriptions',
  props: [ 'width', 'height' ],
  data () {
    return {
      sub: null,
      editing: false
    }
  },
  computed: {
    subscriptions () {
      return this.$store.state.subscriptions.userSubscriptions
    },
    subscriptionsCount () {
      return this.subscriptions.length
    }
  },
  methods: {
    editToggle () {
      this.$log('editToggle')
      this.editing = !this.editing
    },
    async subClick (s, si) {
      this.$log('subClick')
      this.sub = s
      this.$refs.subDialog.show()
    },
    async subDelete (s, si) {
      try {
        this.$log('subDelete start')
        let res = await this.$store.dispatch('subscriptions/unSubscribe', s.oid)
        this.$log('res', res)
        // this.$delete(this.userSubscriptions, ss)
        this.$log('subDelete done')
      } catch (error) {
        this.$log('subDelete error', error)
      }
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
