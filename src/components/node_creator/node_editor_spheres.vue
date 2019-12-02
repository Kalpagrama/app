<template lang="pug">
.row.full-width.q-mt-md
  //- spheres dialog
  k-dialog(ref="spheresDialog" @show="$refs.spheresDialogInput.focus()")
    div(:style=`{position: 'relative'}`).column.fit.bg-white
      div(:style=`{height: '76px'}`).row.full-width.items-center.content-center.q-px-sm
        div(:style=`{position: 'relative', zIndex: 100, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
          q-input(
            ref="spheresDialogInput" v-model="search" filled @keyup.enter="sphereCreate()"
            placeholder="Введите сферу" :maxlength="40").full-width
            template(v-slot:append)
              q-btn(round flat dense color="grey-7" icon="clear" @click="search = ''")
      div(:style=`{position: 'relative', maxWidth: $q.screen.width+'px'}`).col.scroll.full-width
        div(v-if="tagsFiltered.length > 0").row.full-width.items-start.content-start
          div(
            v-for="(t, ti) in tagsFiltered" :key="ti" @click="sphereClick(t, ti)"
            :style=`{height: '60px'}`
            ).row.full-width.items-center.q-px-md
            span {{ t.name }}
        transition(
          appear
          enter-active-class="animated slideInDown"
          leave-active-class="animated slideOutUp")
          q-btn(
            v-if="tagsFiltered.length === 0 && search.length > 0"
            no-caps color="primary" :loading="sphereCreating" @click="sphereCreate()"
            :style=`{position: 'absolute', top: '0px', left: '10px', width: 'calc(100% - 20px)', minHeight: '60px', borderRadius: '10px'}`)
            span Добавить сферу "{{ search }}"
  //- label
  div(:style=`{height: '40px'}`).row.full-width.items-end.q-px-sm
    span.text-bold Сферы
  //- spheres
  div(
    :style=`{position: 'relative', minHeight: '56px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-center.q-pa-sm.bg-grey-4
    .col.full-height
      div(@click.self="$refs.spheresDialog.show()").row.fit.items-start.content-start
        div(
          v-for="(s, si) in spheres" :key="si"
          :style=`{borderRadius: '10px', overflow: 'hidden'}`
          ).row.bg-primary.q-mr-sm.q-mt-sm
          .col
            .row.fit.items-center.q-px-sm
              span.text-white.q-mb-xs {{ s.name }}
          q-btn(round flat color="white" icon="clear" @click="sphereDelete(s, si)")
    q-icon(name="keyboard_arrow_down" size="30px" color="grey-7" @click="$refs.spheresDialog.show()").q-mr-sm
</template>

<script>
export default {
  name: 'nodeEditor__spheres',
  props: ['value'],
  data () {
    return {
      search: '',
      spheres: [],
      inputTop: 0,
      sphereCreating: false
    }
  },
  computed: {
    tags () {
      // return this.$store.getters['workspace/tags']
      return this.$store.state.workspace.workspace.tags
    },
    tagsFiltered () {
      if (this.search.length === 0) return this.tags
      else {
        return this.tags.filter(t => {
          let pattern = new RegExp(this.search, 'g')
          return t.name.match(pattern)
        })
      }
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (to, from) {
        this.$logD('value CHANGED', to)
        this.spheres = to
      }
    }
  },
  methods: {
    sphereClick (t, ti) {
      this.$logD('sphereClick', t, ti)
      let sFind = this.spheres.find(s => (s.name === t.name))
      if (sFind) {
        this.$logD('DUPLICATE')
      } else {
        this.$logD('ADD')
        this.$set(this.spheres, this.spheres.length, {name: t.name})
      }
      this.$refs.spheresDialog.hide()
      this.$emit('input', this.spheres)
    },
    sphereCreate () {
      this.$logD('sphereCreate')
      this.sphereClick({name: this.search})
      this.search = ''
    },
    sphereDelete (s, si) {
      this.$logD('sphereDelete', s, si)
      this.$delete(this.spheres, si)
      this.$emit('input', this.spheres)
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
