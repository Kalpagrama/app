<style lang="sass" scoped>
.kalpa-button
  &:hover
    // background: rgb(114,114,114) !important
</style>

<template lang="pug">
div(:style=`{}`).row.items-center.content-center.q-pt-sm
  //- TODO create CSS variable for #4caf50 color...
  div(
    v-if="screenSet ? screenSet === 'gt.xs' : $q.screen.gt.xs"
    :style=`{borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`).row.no-wrap.b-70
    div(
      v-for="(i, ii) in value" :key="i[idKey]" @click="$emit('id', i[idKey])"
      :class=`{
        'bg-green': id === i[idKey]
      }`
      :style=`{
        position: 'relative', borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden', userSelect: 'none',
        height: '34px',
        minWidth: '50px',
        color: id === i[idKey] ? 'white !important' : '#4caf50',}`
      ).row.items-center.content-center.justify-center.text-green.cursor-pointer.q-px-md.kalpa-button
      span.text-white {{ i.name }}
  q-btn-dropdown(
    v-if="screenSet ? screenSet === 'xs' : $q.screen.xs"
    cover fit
    dense flat color="white" dark no-caps :label="valueName" align="between").q-px-sm.b-70
    q-list(:style=`{zIndex: 50000}`).b-70
      q-item(
        v-for="(i,ii) in value" :key="i[idKey]"
        :style=`{zIndex: 50000}`
        dark clickable v-close-popup @click="$emit('id', i[idKey])").q-px-md.b-70
        q-item-section(dark)
          q-item-label().text-grey-2 {{i.name}}
</template>

<script>
export default {
  name: 'kalpaButtons',
  props: {
    value: {
      type: Array
    },
    id: {
      type: String
    },
    idKey: {
      type: String,
      default () {
        return 'id'
      }
    },
    screenSet: {
      type: [String, Boolean],
      default () {
        return false
      }
    }
  },
  data () {
    return {
    }
  },
  computed: {
    valueName () {
      return this.value.find(v => v.id === this.id).name
    }
  }
}
</script>
