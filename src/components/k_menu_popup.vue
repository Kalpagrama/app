<template lang="pug">
div
  slot
  q-popup-proxy(position="bottom" auto-close anchor="bottom right" self="top right")
    div(:style=`{maxWidth: $q.screen.width < 451 ? '100%' : '230px'}` :class="{'q-pa-md': $q.screen.width <= 450}").row.fit
      div(:style=`{borderRadius: '8px'}`).row.full-width.bg-white
        //- header with name
        div(:style=`{height: '60px', borderBottom: '1px solid #eee'}`).row.full-width.items-center.q-px-md.scroll
          span(:style=`{whiteSpace: 'nowrap'}`).text-bold {{ name | cut(45) }}
        //- actions
        div(v-for="(a, ai) in actions" :key="a.id" @click="$emit('action', a)"
          :style=`{height: '50px'}`
          ).row.full-width.items-center.justify-center.q-px-md.hr.cursor-pointer.scroll
          span(:style=`{color: a.color || 'black', whiteSpace: 'nowrap'}`) {{ a.name }}
      //- cancel
      div(v-if="$q.screen.width < 451" :style=`{height: '60px', borderRadius: '8px'}`
        ).row.full-width.items-center.justify-center.q-mt-md.q-px-md.bg-grey-1
        span(:style=`{color: 'red'}`).text-bold {{ $t('Отмена') }}
</template>

<script>
export default {
  name: 'k_menu_popup',
  props: ['name', 'actions']
}
</script>
