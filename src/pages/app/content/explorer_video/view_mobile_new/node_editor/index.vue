<template lang="pug">
.row.full-width
  div(
    :style=`{
      marginTop: '-20px',
      paddingTop: '20px',
      background: 'rgb(35,35,35)',
      borderRadius: '0 0 10px 10px',
    }`
    ).row.full-width
    //- edit name
    .row.full-width
      q-input(
        v-model="node.name"
        borderless
        placeholder="В чем суть?" dark
        autogrow
        :input-style=`{
          fontSize: '20px',
          fontWeight: 'bold',
          textAlign: 'center'
        }`
        ).full-width
    .row.full-width.justify-center.scroll.q-pa-sm
      .row.no-wrap
        q-btn(
          v-if="!sphereAdding && node.spheres.length < 3"
          @click="sphereAdding = true"
          color="grey-4" no-caps flat
          ).b-40 Добавить сферу
        q-input(
          v-if="sphereAdding"
          v-model="sphere"
          borderless autofocus dense autogrow
          dark
          :input-style=`{
            textAlign: 'center',
            borderRadius: '10px',
            whiteSpace: 'nowrap',
          }`
          @keyup.enter="sphereAdding = false"
          ).b-40
        //- q-btn(
          v-for="n in 1" :key="n"
          flat no-caps color="grey-4" dense
          :style=`{
            whiteSpace: 'nowrap'
          }`
          ).b-40.q-mr-sm
          span(:style=`{opacity: 0}`) lorem ipsum lorem
  .row.full-width.justify-center.q-py-sm
    div(:style=`{maxWidth: '400px'}`).row.full-width
      //- q-btn(
        flat color="grey-4" no-caps
        @click="node = null").br Отмена
      q-btn(
        color="green" no-caps
        :style=`{
          height: '50px',
        }`
        ).full-width Опубликовать
      q-btn(
        @click="$emit('cancel')"
        color="grey-4" no-caps flat
        ).full-width.q-mt-sm Отмена
      //- q-btn(
        flat color="grey-4" no-caps
        ).br Сохранить
</template>

<script>
export default {
  name: 'nodeEditor',
  props: ['node'],
  data () {
    return {
      sphere: '',
      sphereAdding: false,
    }
  }
}
</script>
