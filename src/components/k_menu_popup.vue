<template lang="pug">
div
  slot
  //- anchor="bottom right" self="top right"
  q-popup-proxy(ref="kPopup" position="bottom" cover anchor="bottom right" left="top right")
    div(:style=`{maxWidth: $q.screen.width < 451 ? '100%' : '270px', borderRadius: '10px'}` :class="{'q-pa-sm': $q.screen.width <= 450}").row.fit
      div(:style=`{borderRadius: '10px'}`).row.full-width.bg-white
        //- header with name
        div(v-if="!noName" :style=`{minHeight: '60px', borderBottom: '1px solid #eee'}`).row.full-width.items-center.justify-center.q-px-sm
          span(:style=`{fontSize: '16px'}`).text-bold.text-center {{ name || '' | cut(50) }}
        //- actions
        div(v-for="(a, ai) in actions" :key="a.id" @click="$emit('action', a). $refs.kPopup.hide()"
          :style=`{height: '60px', overflow: 'hidden', borderRadius: '10px'}`
          ).row.full-width.items-center.justify-center.q-px-md.hr.cursor-pointer.scroll
          span(
            :style=`{color: a.color || 'black', whiteSpace: 'nowrap'}`
            :class="a.class || []") {{ a.name }}
      //- hide
      div(v-if="$q.screen.width < 451" @click="$emit('hide'), $refs.kPopup.hide()"
        :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.justify-center.q-mt-md.q-px-sm.bg-grey-1
        span().text-bold.text-primary {{ $t('Отмена') }}
</template>

<script>
export default {
  name: 'k_menu_popup',
  props: ['name', 'noName', 'noCancel', 'actions', 'persistent'],
  methods: {
    toggle () {
      this.$refs.kPopup.toggle()
    },
    show () {
      this.$refs.kPopup.show()
    },
    hide () {
      this.$refs.kPopup.hide()
    }
  }
}
</script>
