<style lang="stylus">
.kinput {
  border: none;
  height: 100%;
  padding: 10px;
  &:focus {
    outline: none;
  }
}
</style>
<template lang="pug">
div(:style=`{backgroundColor: 'rgba(0, 0, 0, 0.2)', }`).row.fit.content-center.justify-center
  q-carousel(
    v-model="slide"
    transition-prev="scale"
    transition-next="scale"
    animated
    :style=`{minHeight: $q.screen.gt.xs ? '70%' : '100%', maxWidth: '500px', borderRadius: '10px'}`
    control-color="white"
    padding
    class="bg-primary text-white")
    //- Lang
    q-carousel-slide(name="1").row.justify-center.items-start
      div(style=`maxWidth: 500px`).row.fit.justify-center.items-center
        div(style='height: 60%').row.content-center
          .row.full-width.justify-center.q-mt-sm
            k-logo(:width="100" :height="100")
          .row.full-width.justify-center.q-mt-md
            span.text-h6 KALPAGRAMMA
            .row.full-width.justify-center
              span {{$t('essence is near')}}...
        div(v-if="side === 'lang'" style=`height: 40%`).row.full-width.content-start
          .row.full-width.justify-center.q-mt-md
            span {{$t('Select language', 'Выберите язык')}}
          .row.full-width.justify-center.q-mt-md
            q-btn(:color="rusColor" @click="chosenLanguage('RUS')").q-mr-sm.text-black РУССКИЙ
            q-btn(:color="engColor" @click="chosenLanguage('ENG')").q-ml-sm.text-black ENGLISH
          div(v-if="lang" :style=`{position: 'absolute', bottom: '0px'}`).row.full-width.justify-end.q-pa-md.q-px-xl
            q-btn(v-model="slide" style=`height: 40px` @click="stForm()" color="accent" :label="$t('Next')")
        div(v-if="side === 'nameFirst'" style=`height: 40%`).row.full-width.content-start.justify-center
          div(style=`maxWidth: 300px`).row.full-width
            .row.full-width.justify-start.q-mt-md
              span {{$t('Enter your First name'), ('Введите свое имя')}}
            div(:style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.content-end.q-mt-sm.bg-white
              input(v-model="nameFirst").full-width.kinput.br
          div(v-if="nameFirst" :style=`{position: 'absolute', bottom: '0px'}`).row.full-width.justify-end.q-pa-md
            q-btn(v-model="slide" style=`height: 40px` @click="ndForm()" color="accent" :label="$t('Next')")
        div(v-if="side === 'nameSecond'" style=`height: 40%`).row.full.width.content-start.justify-center
          div(style=`maxWidth: 300px`).row.full-width
            .row.full-width.justify-start.q-mt-md
              span {{$t('Enter your Second name'), ('Введите свою фамилию')}}
            div(:style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.content-end.q-mt-sm.bg-white
              input(v-model="nameSecond").full-width.kinput
          div(v-if="nameSecond && side === 'nameSecond'" :style=`{position: 'absolute', bottom: '0px'}`).row.full-width.justify-end.q-pa-md
            q-btn(v-model="slide" style=`height: 40px` @click="rdForm()" color="accent" :label="$t('Next')")
    //- PHOTO
    q-carousel-slide(name="2").row.justify-center.items-center
      k-dialog-bottom(ref="userPhotoDialog" mode="actions" :options="userPhotoDialogOptions" @action="userPhotoAction")
      input(ref="fileInput" type="file" @change="fileChanged" :style=`{display: 'none'}`)
      div(style=`height: 50%`).row.row.full-width.justify-center.content-center
        div(style=`border-radius: 50%; border: 3px solid #fff; height: 100px; width: 100px`).row.justify-center.items-center
          q-icon(name="add_a_photo" size="56px")
        .row.full-width.justify-center.q-mt-sm
          span.text-center.text-h5 {{$t('Add a profile photo', 'Добавьте фото профиля')}}
        .row.full-width.justify-center.q-mt-sm
          span.text-center.text-grey-4 {{$t('Add a profile photo that friends could recognize you.', 'Добавьте фото профиля чтобы друзья могли вас узнать.')}}
        .row.full-width.justify-center.q-mt-md
          q-btn(unelevated @click="changePhoto()" color="accent") {{$t('Add a photo')}}
      div(style=`height: 50%`).row.row.full-width.justify-center.q-mt-md.content-start
        div(v-if="$store.state.user.user.profile.thumbUrl").row.full-width.justify-center
          img(:src="$store.state.user.user.profile.thumbUrl" :style=`{width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden'}`).bg-grey-2
        div(v-else).row.full-width.justify-center
          img(src="statics/default_photo.png" :style=`{width: '150px', height: '150px', position: 'center', borderRadius: '50%', overflow: 'hidden'}`).bg-grey-2
        .row.full-width.justify-center.q-mt-md
          span.text-h5.text-bold {{$store.state.user.user.name}}
      div(:style=`{position: 'absolute', zIndex: 100, bottom: '0px'}`).row.full-width.justify-end.q-pa-md
        q-btn(v-model="slide" style=`height: 40px` @click="afterPhoto()" color="accent" :label="$t('Next')")
    //- CATEGORIES
    q-carousel-slide(name="3").row.justify-center.content-start
      div(style=`height: 20%`).row
        .row.full-width.justify-start
          span(style='width: 160px').text-h6 {{$t('Welcome to the')}} Kalpagramma
          .col
        .row.full-width.justify-start
          span {{$t('Choose categories witch you interested in.')}}
      div(style=`height: 70%`).row.full-width.justify-center.scroll
        div(
          v-for="(c, ci) in categories" :key="ci" @click="categoriesToAdd.includes(c.type) ? catDeleteClick(c, ci) : catAddClick(c, ci)"
          :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
          ).row.full-width.items-center.q-mb-sm.bg-white.cursor-pointer.q-px-sm
          .col.full-height.q-ml-sm
            .row.fit.items-center
              span.text-black.text-h6 {{ c.name }}
          div(:style=`{width: '60px', height: '60px', borderRadius: '50%'}`).row.items-center.justify-center
            q-icon(name="done" size="25px" :color="categoriesToAdd.includes(c.type) ? 'black' : 'white'")
      div(:style=`{position: 'absolute', zIndex: 100, bottom: '0px'}`).row.full-width.justify-end.q-pa-md
        q-btn(v-model="slide" v-if="categoriesToAdd.length >= 1" style=`height: 40px` @click="nextSlide()" color="accent" :label="$t('Next')")
    //- find your own essense
    q-carousel-slide(name="4").row.justify-center.items-center
      input(ref="fileInput" type="file" @change="fileChanged" :style=`{display: 'none'}`)
      div(style=`height: 50%`).row.row.full-width.justify-center.content-center
        .row.full-width.justify-center.q-mt-sm
          k-logo(:width="100" :height="100")
        .row.full-width.justify-center.q-mt-md
          span.text-h6 KALPAGRAMMA
          .row.full-width.justify-center
            span {{$t('Create your own connections and make the world more truely', 'Создавай свои собственные ядра, и делай мир более правдивее')}}
            span {{$t('Find your own essense!', 'Найди свою суть!')}}...
      div(style=`height: 50%`).row.row.full-width.justify-center
      div(:style=`{position: 'absolute', zIndex: 100, bottom: '0px'}`).row.full-width.justify-end.q-pa-md
        q-btn(v-model="slide" style=`height: 40px` @click="nextSlide()" color="accent" :label="$t('Start')")
</template>

<script>
export default {
  name: 'kTutorialDialog',
  data () {
    return {
      cat: null,
      chosen: null,
      slide: '1',
      next: '',
      lang: '',
      categoriesToAdd: [],
      nameFirst: '',
      nameSecond: '',
      side: 'lang'
    }
  },
  computed: {
    rusColor () {
      if (this.lang === 'RUS') return 'accent'
      else return 'white'
    },
    engColor () {
      if (this.lang === 'ENG') return 'accent'
      else return 'white'
    },
    categories () {
      return this.$store.state.node.categories
    },
    userPhotoDialogOptions () {
      return {
        confirm: false,
        actions: {
          // makePhoto: {name: 'Make a photo'},
          download: {name: 'Download from device'}
        }
      }
    }
  },
  watch: {
    value: {
      handler (to, from) {
        this.$logD('value CHNAGED', to)
        if (to) {
          this.show()
        } else {
          this.hide()
        }
      }
    }
  },
  methods: {
    async downloadPhoto (file) {
      try {
        this.$log('changePhoto start', file)
        let res = await this.$store.dispatch('objects/setObjectValue', {
          oid: this.$store.state.objects.currentUser.oid,
          path: 'profile.thumbUrl',
          value: file
        })
      } catch (e) {
        this.$log('changePhoto ERROR', e)
      }
    },
    changePhoto () {
      this.$refs.fileInput.click()
    },
    fileChanged (e) {
      this.$log(e.target.files)
      if (e.target.files.length === 1){
        this.file = e.target.files[0]
        this.downloadPhoto(this.file)
      } else throw new Error(`bad selected files len ${e.target.files.length}`)
    },
    afterPhoto () {
      this.$log('afterPhoto')
      this.slide = '3'
      this.file = 'statics/default_photo.png'
      this.$log('file changed', this.file)
      if (!this.file && !this.$store.state.user.user.profile.thumbUrl) {
        this.$log('default photo')
      }
    },
    catDeleteClick (c, ci) {
      this.$logD('catDeleteClick', c)
      this.catIndex = ci
      this.categoriesToAdd = this.categoriesToAdd.filter((cat) => cat !== c.type)
    },
    catAddClick (c, ci) {
      this.$logD('catAddClick', c, ci)
      this.catIndex = ci
      let item = this.categories[this.catIndex].type
      this.$log('item', item)
      this.categoriesToAdd.push(item)
    },
    async catAdd() {
      try {
        this.$logD('catAdd start')
        let res = await this.$store.dispatch('user/setFavouriteCategories', this.categoriesToAdd)
        this.$logD('res', res)
        this.$logD('catAdd done', this.categoriesToAdd)
      } catch (error) {
        this.$logD('catAdd error', error)
      }
    },
    async enterNameFirst () {
      try {
        this.$log('changeNameFirst start')
        let res = await this.$store.dispatch('objects/setObjectValue', {
          oid: this.$store.state.objects.currentUser.oid,
          path: 'profile.nameFirst',
          value: this.nameFirst
        })
        this.$log('changeNameFirst done', res)
      } catch (e) {
        this.$log('changeNameFirst ERROR', e)
        this.$q.notify({message: 'Cant change First name', color: 'red', textColor: 'white'})
      }
    },
    async enterNameSecond () {
      try {
        this.$log('changeNameSecond start')
        let res = await this.$store.dispatch('objects/setObjectValue', {
          oid: this.$store.state.objects.currentUser.oid,
          path: 'profile.nameSecond',
          value: this.nameSecond
        })
        this.$log('changeNameSecond done', res)
      } catch (e) {
        this.$log('changeNameSecond ERROR', e)
        this.$q.notify({message: 'Cant change Second name', color: 'red', textColor: 'white'})
      }
    },
    async chosenLanguage (n) {
      this.lang = n
      try {
        this.$log('changeLanguage start')
        let res = await this.$store.dispatch('objects/setObjectValue', {
          oid: this.$store.state.objects.currentUser.oid,
          path: 'profile.lang',
          value: this.lang
        })
        this.$log('changeLanguage done', res)
      } catch (e) {
        this.$log('changeLanguage ERROR', n)
        this.$q.notify({message: 'Cant change Language', color: 'red', textColor: 'white'})
      }
      this.$log(this.lang)
    },
    chosenContent () {
      this.chosen = !this.chosen
    },
    async nextSlide () {
      if (this.slide === '1') this.next = '2'
      if (this.slide === '2') this.next = '3'
      if (this.slide === '3') this.next = '4'
      if (this.slide === '4') this.next = '5'
      this.slide = this.next
      if (this.next === '5') {
        let res = await this.$store.dispatch('objects/setObjectValue', {
          oid: this.$store.state.objects.currentUser.oid,
          path: 'profile.tutorial',
          value: false
        })
        this.$emit('hide')
      }
    },
    stForm () {
      this.side = 'nameFirst'
    },
    ndForm () {
      this.side = 'nameSecond'
      this.enterNameFirst(this.nameFirst)
    },
    rdForm () {
      this.slide = '2'
      this.enterNameSecond(this.nameSecond)
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
    this.categoriesToAdd.map((cat) => {
      this.catAdd({oid: cat})
    })
  }
}
</script>
