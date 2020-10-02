<template lang="pug">
.row.full-width
  div(
    :style=`{
      borderRadius: '10px', overflow: 'hidden',
      //- background: 'rgb(35,35,35)',
    }`
    ).row.full-width.q-pa-sm.b-40
    .row.full-width.items-end.content-end.q-pa-sm
      .col-6.q-pr-xs
        link-item(
          :link="link"
          :item="link.leftItem"
          :style=`{
            transform: 'perspective(600px) rotateY(10deg)'
          }`)
          template(v-slot:footer)
            div(
              v-if="!['ESSENCE', 'ASSOCIATIVE'].includes(link.jointType)"
              :style=`{height: '40px'}`).row.full-width.items-center.content-center.justify-end
              span.text-white.text-bold {{ getItemTypeName(0, link.jointType) }}
      .col-6.q-pl-xs
        link-item(
          :link="link"
          :item="link.rightItem"
          :style=`{
            transform: 'perspective(600px) rotateY(-10deg)'
          }`)
          template(v-slot:footer)
            div(
              v-if="!['ESSENCE', 'ASSOCIATIVE'].includes(link.jointType)"
              :style=`{height: '40px'}`).row.full-width.items-center.content-center.justify-start
              span.text-white.text-bold {{ getItemTypeName(1, link.jointType) }}
    //- type
    //- .row.full-width.justify-center
      small.text-white {{ link.jointType }}
    //- name
    div(
      ).row.full-width.justify-center.q-pa-sm
      span(:style=`{fontSize: '20px'}`).text-white.text-bold.shaking.cursor-pointer {{ link.name }}
  //- actions
  //- .row.full-width.justify-center
    span.text-white actions
</template>

<script>
export default {
  name: 'linkFeed',
  props: ['link'],
  components: {
    linkItem: () => import('./link_item.vue'),
  },
  data () {
    return {
    }
  },
  computed: {
    itemTypes () {
      return [
        {id: 'ESSENCE', name: 'По сути', pair: 'ESSENCE'},
        {id: 'ASSOCIATIVE', name: 'Ассоциация', pair: 'ASSOCIATIVE'},
        {id: 'CAUSE', name: 'Причина', pair: 'EFFECT'},
        {id: 'EFFECT', name: 'Следствие', pair: 'CAUSE'},
        {id: 'PROBLEM', name: 'Проблема', pair: 'SOLUTION'},
        {id: 'SOLUTION', name: 'Решение', pair: 'PROBLEM'},
        {id: 'TRUE', name: 'Правда', pair: 'FALSE'},
        {id: 'FALSE', name: 'Ложь', pair: 'TRUE'},
        {id: 'FROM', name: 'Первое', pair: 'TO'},
        {id: 'TO', name: 'Второе', pair: 'FROM'},
      ]
    },
    types () {
      return [
        // {id: 'ESSENCE'},
        // {id: 'ASSOCIATIVE'},
        {id: 'CAUSE_EFFECT', names: ['Причина', 'Следствие']},
        {id: 'PROBLEM_SOLUTION', names: ['Проблема', 'Решение']},
        {id: 'FALSE_TRUE', names: ['Ложь', 'Правда']},
        {id: 'FROM_TO', names: ['Первое', 'Второе']}
      ]
    }
  },
  methods: {
    getItemTypeName (index, val) {
      this.$log('getItemTypeName', index, val)
      if (['ESSENCE', 'ASSOCIATIVE'].includes(val)) return ''
      else {
        let t = this.types.find(t => t.id === val)
        this.$log('t', t)
        return t.names[index]
      }
    }
  }
}
</script>
