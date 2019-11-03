<template lang="pug">
q-layout.lt-sm
  //- header
  q-header(reveal).row.items-center
    q-item(clickble v-ripple :to="`/app/home`" :style=`{height: '50px'}` @click="pageClick('/app/home')").row.q-px-sm
      q-item-section(avatar)
        q-btn(round flat color="primary")
          q-icon(name="blur_on" color="white" style=`fontSize: 42px`)
      q-item-section
          span.text-bold.text-white Кальпаграмма
    .col
    div(:style=`{width: '50px', height: '50px'}`).row.items-center.justify-center
      q-btn(round flat icon="settings" color="white" @click="")
    //- div(:style=`{width: '70px', height: '70px'}`).row.items-center.justify-center
    //-   q-btn(round flat icon="person_add" color="white" @click="$router.push({name: 'invite'})")
  //- page
  q-page-container(style=`height: 100vh`).bg-grey-2
    menumobile
    //- div(
      v-for="(m, mkey) in 100" :key="mkey"
      :style=`{height: '60px'}`
      ).row.full-width.items-center.q-px-md
      span Menu {{ m }}
  //- footer
  q-footer(reveal).bg-grey-2.lt-md
    k-menu-horiz(page="menu" :colors="['white', 'grey-7']")
</template>

<script>
import menumobile from 'components/menumobile'
export default {
  name: 'menu',
  components: { menumobile },
  data () {
    return {
    }
  },
  methods: {
   async pageClick (path) {
    this.$log('pageClick', path)
    this.$root.$emit('toggle_menu')
    await this.$wait(200)
    this.$router.push(path)
  }
  },
  mounted () {
   this.$log('mounted')
  },
  beforeDestroy () {
   this.$log('beforeDestroy')
  }
 }
</script>
