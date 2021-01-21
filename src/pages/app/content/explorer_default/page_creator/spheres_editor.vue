<template lang="pug">
.row.full-width
  //- header
  .row.full-width.justify-center.q-px-sm
    div(
      :style=`{
        maxWidth: '386px',
      }`
      ).row.full-width.justify-center.q-pa-sm
      span.text-grey-6 Дополнительные сферы сути:
  //- sphere input
  .row.full-width.justify-center.q-px-sm
    q-input(
      v-model="sphereString"
      borderless dark dense
      @keyup.enter="sphereAdd"
      :placeholder="'Введите сферу'"
      :input-style=`{
        background: 'rgb(35,35,35)',
        borderRadius: '10px',
        textAlign: 'center',
      }`
      :style=`{
        //- maxWidth: '386px',
        maxWidth: '280px',
      }`
      ).full-width
      template(v-slot:append)
        q-btn(
          v-if="sphereString.length > 0"
          @click="sphereString = ''"
          round flat color="grey-8" icon="clear")
        q-btn(
          v-if="sphereString.length > 0"
          @click="sphereAdd"
          round flat color="green" icon="check")
  //- spheres list
  .row.full-width.justify-center.q-px-sm
    div(
      :style=`{
        //- maxWidth: '386px',
        maxWidth: '280px',
      }`
      ).row.full-width.items-start.content-start.q-py-sm
      div(
        v-for="(s,si) in node.spheres" :key="si"
        :style=`{
          minHeight: '44px',
          background: 'rgb(33,33,33)',
          borderRadius: '10px',
        }`
        ).row.full-width.items-center.content-center.q-pa-sm.q-mb-sm
        q-icon(name="blur_on" color="grey-5" size="20px").q-mx-xs
        .col
          .row.fit.items-center.content-center.q-pl-xs
            span(
              :style=`{
                userSelect: 'none',
                pointerEvents: 'none',
              }`
              ).text-grey-5 {{ s.name }}
        q-btn(
          @click="sphereDelete(s,si)"
          round flat dense icon="delete_outline" color="grey-9")
</template>

<script>
export default {
  name: 'spheresEditor',
  props: ['node'],
  data () {
    return {
      sphereString: '',
    }
  },
  methods: {
    sphereAdd () {
      this.$log('sphereAdd')
      if (this.node.spheres.length >= 5) {
        this.$q.notify({type: 'negative', position: 'top', message: 'Максимум 5 дополнительных сфер ! '})
        return
      }
      if (this.sphereString.length === 0) return
      this.node.spheres.push({name: this.sphereString})
      this.sphereString = ''
    },
    sphereDelete (s, si) {
      this.$log('sphereDelete', s, si)
      this.$delete(this.node.spheres, si)
    }
  }
}
</script>
