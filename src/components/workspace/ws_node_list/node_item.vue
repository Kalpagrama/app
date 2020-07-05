<style lang="sass" scoped>
.node-saved
  cursor: pointer
  &:hover
    background: rgb(60,60,60)
</style>

<template lang="pug">
.col-xs-12.col-sm-6.q-pa-sm
  div(
    @click.self="onClick()"
    :style=`{
      position: 'relative',
      minHeight: '100px',
      borderRadius: '10px',
    }`
    ).row.full-width.node-saved.q-pa-sm.b-50
    //- actions
    q-btn(
      round flat dense color="grey-7" icon="more_vert"
      :style=`{
        position: 'absolute', zIndex: 999, top: '4px', right: 0,
      }`)
      kalpa-menu-popup(:actions="actions")
    //- previews
    div(
      v-if="node.items[0]"
      @click="onClick()"
      :style=`{position: 'relative',}`).row.full-height
      img(
        :src="node.items[0].thumbOid"
        draggable="false"
        :style=`{
          zIndex: 100,
          height: '100px',
          borderRadius: '10px',
          overflow: 'hidden',
          userSelect: 'none',
        }`).shadow-10
      img(
        v-for="(i,ii) in node.items" :key="ii"
        v-if="ii > 0"
        :src="i.thumbOid"
        draggable="false"
        :style=`{
          position: 'absolute', zIndex: 100-ii,
          left: (33*ii)+'%',
          top: (5*ii)+'px',
          height: 100-(10*ii)+'%',
          borderRadius: '10px',
          overflow: 'hidden',
          opacity: 1-(0.1*ii),
          userSelect: 'none',
        }`).shadow-5
    div(
      @click="onClick()"
      ).row.full-width.q-pa-sm
      span(:style=`{userSelect: 'none'}`).text-white.text-bold {{nodeName }}
</template>

<script>
export default {
  name: 'nodeItem',
  props: ['node', 'nodeIndex'],
  data () {
    return {
    }
  },
  computed: {
    nodeName () {
      return this.node.name
    },
    actions () {
      if (this.node.stage === 'draft') {
        return {
          edit: {name: this.$t('nodeItemAction_edit', 'Редактировать'), fn: () => { this.$emit('edit') }},
          delete: {name: this.$t('nodeItemAction_delete', 'Удалить'), fn: () => { this.$emit('delete') }}
        }
      }
      else if (this.node.stage === 'saved') {
        return {
          fork: {name: this.$t('nodeItemAction_fork', 'Форкнуть'), fn: () => { this.$emit('fork') }},
          unSave: {name: this.$t('nodeItemAction', 'Удалить из сохраненных'), fn: () => { this.$emit('unSave') }},
        }
      }
      else if (this.node.stage === 'published') {
        return {
          fork: {name: this.$t('nodeItemAction_fork', 'Форкнуть'), fn: () => { this.$emit('fork') }},
          unPublish: {name: this.$t('nodeItemAction_upPublish', 'Снять с публикации'), fn: () => { this.$emit('upPublish') }}
        }
      }
      else {
        return {}
      }
    }
  },
  methods: {
    onClick () {
      this.$log('onClick')
      if (this.node.stage === 'draft') this.$emit('edit')
      else this.$emit('preview')
    }
  }
}
</script>
