<template lang="pug">
.column.fit.bg-grey-1
  q-dialog(ref="whocould")
    div(style=`border-radius: 10px; overflow: hidden`).row.full-width.justify-center.bg-white
      div(:style=`{borderBottom: '1px solid #eee'}`).row.justify-left.items-center.q-px-md
        q-radio(v-model="show" @click="$refs.whocould.toggle()" color="accent" val="all" label="All").row.full-width
        q-radio(v-model="show" @click="$refs.whocould.toggle()" color="accent" val="important" label="Important").row.full-width
        q-radio(v-model="show" @click="$refs.whocould.toggle()" color="accent" val="neither" label="Neither").row.full-width
  .row.full-width.items-center
    div(:style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.full-width.justify-center.items-center.q-px-md
      span {{$t('Allow people to find me')}}
      .col
      q-toggle(v-model="find" color="accent")
    div(:style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.full-width.justify-center.items-center.q-px-md
      span {{$t('Closed account')}}
      .col
      q-toggle(v-model="closedAc" color="accent")
    div(:style=`{borderBottom: '1px solid #eee'}`).row.full-width.justify-center.items-start
      q-expansion-item(
        expand-separator
        label="Personal sphere"
        ).full-width.bg-grey-1
          q-card.bg-grey-1
            q-card-section
              div(v-for="(s, si) in spheres" :key="si" @click="$refs.whocould.show()"
              :style=`{height: '50px'}`).row.items-center.bg-grey-1
                span {{$t(s.name)}}
    div(:style=`{height: '50px', borderBottom: '1px solid #eee'}` @click="$refs.whocould.show()").row.full-width.justify-start.items-center.q-px-md
      span {{$t('Who can send me messages')}}
    div(:style=`{height: '50px', borderBottom: '1px solid #eee'}` @click="$refs.whocould.show()").row.full-width.justify-start.items-center.q-px-md
      span {{$t('Who can bind nuclei to me')}}
    div(:style=`{height: '50px', borderBottom: '1px solid #eee'}` @click="$refs.whocould.show()").row.full-width.justify-start.items-center.q-px-md
      span {{$t('Who can find me in import contacts')}}
    div(:style=`{height: '50px', borderBottom: '1px solid #eee'}` @click="$refs.whocould.show()").row.full-width.justify-start.items-center.q-px-md
      span {{$t('Blocked')}}
</template>

<script>
export default {
  name: 'pageApp__Settings__Privacy',
  data () {
    return {
      find: true,
      closedAc: false,
      show: '',
      spheres: [
        {name: 'Who can view the kernels created by me', show: 'all'},
        {name: 'Who can view the kernels for which I voted', show: 'all'},
        {name: 'Who can view the kernels that are associated with me', show: 'all'},
        {name: 'Who can view the chains I created', show: 'all'}
      ]
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
