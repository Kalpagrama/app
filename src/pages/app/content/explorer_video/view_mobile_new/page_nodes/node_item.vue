<template lang="pug">
node-feed(
  :node="node" :isActive="isActive" :isVisible="isVisible"
  :showName="isOpened")
  template(v-slot:items v-if="!isOpened")
    .row.full-width.items-start.content-start.q-px-sm
      div(
        @click="isOpened = true"
        :style=`{
          position: 'relative',
          borderRadius: '10px',
          height: '60px',
        }`).row.full-width.b-40.q-mb-sm
        img(
          :src="item.thumbUrl"
          :style=`{
            height: '60px',
            borderRadius: '10px',
          }`)
        .col.full-height
          .row.fit.items-center.content-center.justify-center
            span(
              :style=`{
                fontSize: '20px',
                //- marginRight: '100px',
              }`).text-white.text-bold {{ name }}
        img(
          v-if="itemRight"
          :src="itemRight.thumbUrl"
          :style=`{
            height: '60px',
            borderRadius: '10px',
          }`)
</template>

<script>
export default {
  name: 'pageNodes_item',
  props: ['node', 'player', 'contentKalpa', 'isFocused', 'isActive', 'isVisible'],
  components: {
  },
  data () {
    return {
      isOpened: false,
    }
  },
  computed: {
    itemRight () {
      return this.node.items.find(i => {
        if (i.layers) {
          return i.layers[0].contentOid !== this.contentKalpa.oid
        }
        else {
          return true
        }
      })
    },
    item () {
      return this.node.items.find(i => {
        if (i.layers) {
          return i.layers[0].contentOid === this.contentKalpa.oid
        }
        else {
          return true
        }
      })
    },
    start () {
      return this.item.layers[0].figuresAbsolute[0].t
    },
    end () {
      return this.item.layers[0].figuresAbsolute[1].t
    },
    duration () {
      return this.end - this.start
    },
    name () {
      if (this.node.vertices.length > 0) {
        if (this.node.vertices[0] === 'ESSENCE') {
          return this.node.name
        }
        else if (this.node.vertices[0] === 'ASSOCIATIVE') {
          return ''
        }
        else {
          return `${this.itemType(0).name}-${this.itemType(1).name}`
        }
      }
      else {
        return this.node.name
      }
    },
    itemTypes () {
      return [
        {id: 'ESSENCE', name: 'По сути', pair: 'ESSENCE'},
        {id: 'ASSOCIATIVE', name: 'Ассоциация', pair: 'ASSOCIATIVE'},
        // cause/effect
        {id: 'CAUSE', name: 'Причина', pair: 'EFFECT'},
        {id: 'EFFECT', name: 'Следствие', pair: 'CAUSE'},
        // problem/solution
        {id: 'PROBLEM', name: 'Проблема', pair: 'SOLUTION'},
        {id: 'SOLUTION', name: 'Решение', pair: 'PROBLEM'},
        // from/to
        {id: 'FROM', name: 'До', pair: 'TO'},
        {id: 'TO', name: 'После', pair: 'FROM'},
        // fake/disproof
        {id: 'FAKE', name: 'Фэйк', pair: 'FALSE'},
        {id: 'DISPROOF', name: 'Опровержение', pair: 'TRUE'},
        // fact/proof
        {id: 'FACT', name: 'Факт', pair: 'FALSE'},
        {id: 'PROOF', name: 'Подтверждение', pair: 'TRUE'},
        // question/answer
        {id: 'QUESTION', name: 'Вопрос', pair: 'ANSWER'},
        {id: 'ANSWER', name: 'Ответ', pair: 'QUESTION'},
      ]
    },
  },
  methods: {
    itemType (index) {
      return this.itemTypes.find(i => i.id === this.node.vertices[index])
    }
  }
}
</script>
