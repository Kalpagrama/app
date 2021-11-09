<template lang="pug">
div(:style=`{backgroundColor: $q.screen.xs ? 'rgb(29,29,29)' : ''}`).row.full-width.justify-center.items-center.content-center
  q-stepper(
    v-model="step"
    ref="stepper"
    dark swipeable
    animated alternative-labels
    :contracted="true"
    done-color="green"
    active-color="white"
    inactive-color="grey"
    color="green"
    flat
      :style=`{
        borderRadius: $q.screen.xs ? '0px' : '20px',
        height: $q.screen.xs ? '100%' : '600px',
        width: $q.screen.xs ? '100%' : '400px',
        paddingTop: $q.screen.xs ? '0px' : '0px'
      }`).relative-position
    q-step(
      :name="1"
      active-icon="fas fa-user-edit"
      :title="$t('Имя')"
      done-icon="fas fa-user-edit"
      done-color="green-8"
      icon="fas fa-user-edit"
      :done="done['1'] && !!name").row.full-width.content-center.items-center.justify-center
      .row.full-width.content-center.items-center.justify-center
        div(:style=`{
            maxHeight: $q.screen.xs ? '55vh' : '350px',
            height: $q.screen.xs ? '55vh' : '350px',
            maxWidth: '300px',
            width: '300px'}`)
          edit-avatar(:currentUser="$store.getters.currentUser")
          edit-name(:initialName="name" :currentUser="$store.getters.currentUser" @name="name = $event")
            //edit-profile(:currentUser="currentUser")
    q-step(
      :name="2"
      :title="$t('Пароль')"
      icon="fas fa-key"
      active-icon="fas fa-key"
        done-icon="fas fa-key"
      :done="done['2']")
      .row.full-width.content-center.items-center.justify-center
        div(:style=`{
            maxHeight: $q.screen.xs ? '55vh' : '350px',
            height: $q.screen.xs ? '55vh' : '350px',
          maxWidth: '350px',
          width: '350px'}`)
          edit-password(
            :currentUser="$store.getters.currentUser"
            :fold="false"
            :header="false")
    q-step(
      :name="3"
      :title="$t('Интересы')"
        icon="fas fa-plus"
        active-icon="fas fa-plus"
        done-icon="fas fa-plus"
      :done="done['4']")
      .row.full-width.justify-center
        div(:style=`{
            maxHeight: $q.screen.xs ? '55vh' : '350px',
            height: $q.screen.xs ? '55vh' : '350px',
          maxWidth: '350px',
          width: '350px'}`)
          .row.full-width
            div(v-for="(c, ix) in categories").col-6.q-pa-xs
              q-responsive(:ratio="1.618" :style=`{overflow: 'hidden', borderRadius: '', position: 'relative'}`).full-width.br-10.relative-position
                img(
                  :src="c.icon"
                  :style=`{
                    // height: '60px',
                    // opacity: 0.2,
                    objectFit: 'cover',
                    borderRadius: '10px'}`)
                div(:style=`{background: 'rgba(0,0,0,0.2)'}` @click="c.checked=!c.checked").absolute-full.row.content-end.items-end.justify-center.cursor-pointer
                  div(v-if="c.type !== 'SYMPOSIUM'").row.q-pb-none
                    span(v-if="$q.screen.lt.md" :style=`{fontSize: '16px', textShadow: '2px 2px 2px '+$getPaletteColor('grey-10')}`).text-grey-1.text-bold.text-center {{c.alias}}
                    span(v-else :style=`{fontSize: '15px', textShadow: '2px 2px 2px '+$getPaletteColor('grey-10')}`).text-grey-1.text-bold.text-center {{c.alias}}
                  q-toggle(
                    v-model="c.checked"
                    checked-icon="check"
                    color="green" dense
                  unchecked-icon="clear"
                  ).absolute-top-left.q-pa-xs
    template(v-slot:navigation)
      q-stepper-navigation.absolute-bottom
        .row.full-width.justify-end.items-center.content-center
          q-btn(v-if="hasPrev" flat color="grey" :ripple="false" @click="prev" :label="$t('Back', 'Назад')")
          q-btn(@click="next()" :disable="!name" outline color="green-8" :label="hasNext ? $t('Continue', 'Продолжить') : $t('Finish', 'Готово')")
    template(v-slot:message)
      q-banner(v-if="step === 1").text-white.text-center.b-50 {{$t('Введите ваше имя и добавьте фото')}}
      q-banner(v-if="step === 2").text-white.text-center.b-50 {{$t('Укажите постоянный пароль (необязательно)')}}
      q-banner(v-if="step === 3").text-white.text-center.b-50 {{$t('Подпишитесь на то, что Вам интересно')}}

</template>

<script>
import editName from 'src/pages/app/settings/view_account/edit_profile/edit_name';
import editPassword from 'src/pages/app/settings/view_account/edit_profile/edit_password.vue';
import editAvatar from 'src/pages/app/settings/view_account/edit_avatar/index.vue';
import cloneDeep from 'lodash/cloneDeep'
import {UserApi} from '../../api/user';
import {ObjectApi} from '../../api/object';

const stepEnum = Object.freeze({
  STEP_NAME: 1,
  STEP_PASSWORD: 2,
  // STEP_PHOTO: 3,
  STEP_SUBSCRIBE: 3,
})
export default {
  name: 'kalpaInitialSetup',
  props: [],
  components: {
    editAvatar,
    editName,
    editPassword,
  },
  data() {
    return {
      categories: cloneDeep(this.$store.getters.nodeCategories).filter(c => c.type !== 'ALL').map(c => {
        c.checked = false
        return c
      }),
      step: stepEnum.STEP_NAME,
      done: {},
      name: '',
      subscribe: false,
    }
  },
  computed: {
    hasNext() {
      return this.step !== Object.values(stepEnum).reduce((max, step) => Math.max(step, max))
    },
    hasPrev() {
      return this.step !== Object.values(stepEnum).reduce((min, step) => Math.min(step, min))
    }
  },
  methods: {
    async next() {
      if (this.hasNext) {
        this.done[this.step] = true
        let nextStep = Object.values(stepEnum).reduce((acc, step) => {
          return step === this.step ? step + 1 : acc
        }, null)
        this.step = nextStep
      } else {
        await this.saveCategories()
        let notice = cloneDeep(this.$store.getters.currentUser.profile.notice)
        notice.initial_settings = true
        await ObjectApi.update(this.$store.getters.currentUser.oid, 'profile.notice', notice)
        this.$emit('close')
      }
    },
    prev() {
      if (this.hasPrev) {
        this.done[this.step] = false
        let prevStep = Object.values(stepEnum).reduce((acc, step) => {
          return step === this.step ? step - 1 : acc
        }, null)
        this.step = prevStep
      }
    },
    async saveCategories() {
      let selected = this.categories.map(c => c.checked ? c.type : null).filter(t => !!t)
      await UserApi.setFavouriteCategories(selected)
    }
  },
  created() {
    this.$log('created')
  },
  async mounted() {
    this.$log('mounted')
  },
  async beforeUnmount () {
    this.$log('beforeDestroy')
    this.$eventBus.$emit('notice-check', 'tutorial_main')
  }
}
</script>
