<template lang="pug">
.column.fit.bg-white
  //- Phone
  q-dialog(ref="changePhone" :maximized="true" transition-show="slide-left" transition-hide="slide-right").bg-secondary
    div(style=`height: 60px`).row.items-center.bg-primary
      div(style=`height: 60px`).row.justify-left.items-center
        q-btn(round flat icon="arrow_back" color="white" @click="$refs.changePhone.toggle()")
      .col.row.justify-start.items-center.q-px-sm
        span.text-bold.text-white {{$t('Changing phone number')}}
    .column.bg-white.q-px-md
      .row.full-width.justify-left.q-my-md
        span You can attach your personal <b>phone number</b> to the page. This will protect your page.
      div(style=`border-radius: 10px;`).row.content-start.justify-center
        q-input(v-model="newPhone" stack-label label="Phone number" prefix="+7" filled).full-width.q-mb-md
        q-btn(
          push no-caps dense color="accent" @click=""
          :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mb-sm {{ $t('Get code') }}
        .row.full-width.justify-start
          small.text-grey {{ $t('Example for Russia:') }} +7 921 0000007
  //- Email
  q-dialog(ref="changeEmail" :maximized="true" transition-show="slide-left" transition-hide="slide-right").bg-secondary
    div(style=`height: 60px`).row.items-center.bg-primary
      div(style=`height: 60px`).row.justify-left.items-center
        q-btn(round flat icon="arrow_back" color="white" @click="$refs.changeEmail.toggle()")
      .col.row.justify-start.items-center.q-px-sm
        span.text-bold.text-white {{$t('Changing email')}}
    .column.bg-white.q-px-md
      .row.content-start.justify-center
        q-input(v-model="settings.general.email" standout disable readonly stack-label label="Current email").full-width.q-my-md.text-black
        q-input(v-model="newEmail" stack-label label="New email" filled).full-width.q-mb-md
        q-btn(
          push no-caps dense color="accent" @click=""
          :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mb-sm {{ $t('Save email') }}
  //- Pasword
  q-dialog(ref="changePasword" :maximized="true" transition-show="slide-left" transition-hide="slide-right").bg-secondary
    div(style=`height: 60px`).row.items-center.bg-primary
      div(style=`height: 60px`).row.justify-left.items-center
        q-btn(round flat icon="arrow_back" color="white" @click="$refs.changePasword.toggle()")
      .col.row.justify-start.items-center.q-px-sm
        span.text-bold.text-white {{$t('Changing password')}}
    .column.bg-white.q-px-md
      .row.content-start.justify-center
        q-input(v-model="currentPas" stack-label label="Current pasword" filled).full-width.q-my-md
        q-input(v-model="newPas" stack-label label="New pasword" filled).full-width.q-mb-md
        q-input(v-model="repPas" stack-label label="Repeate pasword" filled).full-width.q-mb-md
        q-btn(
          push no-caps dense color="accent" @click=""
          :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mb-sm {{ $t('Change pasword') }}
  //- Nickname
  q-dialog(ref="changeNickname" :maximized="true" transition-show="slide-left" transition-hide="slide-right").bg-secondary
    div(style=`height: 60px`).row.items-center.bg-primary
      div(style=`height: 60px`).row.justify-left.items-center
        q-btn(round flat icon="arrow_back" color="white" @click="$refs.changeNickname.toggle()")
      .col.row.justify-start.items-center.q-px-sm
        span.text-bold.text-white {{$t('Changing nickname')}}
    .column.bg-white.q-px-md
      .row.content-start.justify-center
        q-input(v-model="newNickname" stack-label label="New nickname" filled).full-width.q-my-md
        q-btn(
          push no-caps dense color="accent" @click=""
          :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mb-sm {{ $t('Change nickname') }}
  //- Language
  q-dialog(ref="changeLanguage" :maximized="true" transition-show="slide-left" transition-hide="slide-right").bg-secondary
    div(style=`height: 60px`).row.items-center.bg-primary
      div(style=`height: 60px`).row.justify-left.items-center
        q-btn(round flat icon="arrow_back" color="white" @click="$refs.changeLanguage.toggle()")
      .col.row.justify-start.items-center.q-px-sm
        span.text-bold.text-white {{$t('Changing language')}}
    .column.bg-white.q-px-md
      .row.content-start.justify-center
        q-input(v-model="settings.general.language" stack-label label="Language" filled).full-width.q-my-md
        q-btn(
          push no-caps dense color="accent" @click=""
          :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mb-sm {{ $t('Change language') }}
  div(:style=`{height: '60px', borderBottom: '1px solid #eee'}` @click="$refs.changePhone.show()").row.justify-left.items-center.q-py-sm.q-px-md.cursor-pointer.hr
    .row.full-width
      span {{$t("Phone number")}}
    .row.full-width
      small.text-grey  {{ settings.general.phone }}
  div(:style=`{height: '60px', borderBottom: '1px solid #eee'}` @click="$refs.changeEmail.show()").row.justify-left.items-center.q-py-sm.q-px-md.cursor-pointer.hr
    .row.full-width
      span {{$t('Email')}}
    .row.full-width
      small.text-grey {{ settings.general.email }}
  div(:style=`{height: '60px', borderBottom: '1px solid #eee'}` @click="$refs.changePasword.show()").row.justify-left.items-center.q-py-sm.q-px-md.cursor-pointer.hr
    .row.full-width
      span {{$t('Change pasword')}}
  div(:style=`{height: '60px', borderBottom: '1px solid #eee'}` @click="$refs.changeNickname.show()").row.justify-left.items-center.q-py-sm.q-px-md.cursor-pointer.hr
    .row.full-width
      span {{$t('Nickname')}}
    .row.full-width
      small.text-grey  {{ settings.general.nickname }}
  div(:style=`{height: '60px', borderBottom: '1px solid #eee'}` @click="$refs.changeLanguage.show()").row.justify-left.items-center.q-py-sm.q-px-md.cursor-pointer.hr
    .row.full-width
      span Language
    .row.full-width
      small.text-grey  {{ settings.general.language }}
</template>

<script>
export default {
  name: 'pageApp__settings__account',
  data () {
    return {
      newPhone: '',
      newEmail: '',
      newPasword: '',
      newPas: '',
      currentPas: '',
      repPas: '',
      newNickname: '',
      settings: {
        general: {
          language: 'Russian',
          phone: '+7 *** *** ** 99',
          email: 'ro***@mail.ru',
          nickname: 'terminator3000'
        }
      }
    }
  }
}
</script>
