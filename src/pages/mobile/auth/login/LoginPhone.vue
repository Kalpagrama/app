<template lang="pug">
q-page.column.window-height
  //- header
  div(style=`height: 70px; borderBottom: 1px solid #eee`).row.items-center.justify-center
    h6.text-weight-bold.head-title Вход по номеру телефона
  //- body
  .col
    .row.fit.content-center
      .row.full-width
        //- get phone
        .row.full-width.justify-center
          q-input(ref="phone" lazy-rules v-model="phone" filled
              style=`maxWidth: 255px`
              :input-style=`{fontSize: '20px'}`
              type="phone" placeholder="(982) 725 82 32" mask="(###) ### - ## - ##")
              template(v-slot:prepend)
                span +7
        //- get code
        div(style=`height: 60px`).row.full-width.justify-center
          q-btn(
            @click="getCode()"
            :label="code_getting ? `Осталось ${getWaitingSecs} сек` : 'Получить код'" color="primary"
            style=`width: 255px; height: 60px`)
        //- confirm code
        div(style=`height: 60px`).row.full-width.justify-center
          q-input(
            v-show="code_getting"
            ref="phone" lazy-rules v-model="code" filled
            style=`maxWidth: 255px`
            :input-style=`{fontSize: '20px'}`
            type="number" mask="####").row.full-width
        div(style=`height: 60px`).row.full-width.justify-center
          q-btn(
            v-show="code_getting"
            @click="confirmCode()"
            label="Подтвердить код" color="primary"
            style=`width: 255px; height: 60px`)
  //- .q-pa-md.q-gutter-y-sm
  //-   form(ref="form" @submit.prevent="onSubmit").q-px-md
  //-     p.text-left.success.text-caption.q-mt-sm(v-if="successPhoneCode") Проверочный код выслан по указанному номеру телефона.
  //-     q-input.text-right.flex-double(v-if="visibleCodeBlock" lazy-rules dense="dense" v-model.number="code" type="password" mask="####" hint="####" )
  //-       template(v-slot:before)
  //-         span.extra-small-text Проверочный код:
  //-     .q-gutter-y-sm.full-height.q-pa-md.q-mt-sm
  //-       q-btn.btn-auth(v-if="!visibleCodeBlock" style=`height: 50px` :disabled="disabled" type="submit" :loading="submitting").full-width Выслать код
  //-       q-btn.btn-auth(v-else size='12px' :disabled="disabled" type="submit" :loading="submitting") Выслать код повторно
  //-     //p.text-left.warning.text-caption.q-mt-sm(v-if="errorPhoneCode") Неверный проверочный код, попробуйте отправить повторно
</template>

<script>
import AuthMixin from '../AuthMixin';

export default {
  name: 'PageMobileLoginPhone',
  mixins: [ AuthMixin ],
  data() {
    return {
      disabled: true,
      successPhoneCode: false,
      visibleCodeBlock: false,
      submitting: false,
      phone: '',
      phone_checked: false,
      code: '',
      code_confirming: false,
      code_getting: false,
      code_getting_stream: null,
      code_getting_timeout: 60 * 1000,
      code_getting_waited: 0
    }
  },
  watch: {
    phone() {
      if (this.phone.length >= 16) {
        this.disabled = false;
      } else {
        this.disabled = true;
      }
    },
    code(val) {
      this.validateCode(val);
    },
  },
  computed: {
    getWaitingSecs () {
      return (this.code_getting_timeout - this.code_getting_waited) / 1000
    }
  },
  methods: {
    async getCode () {
      this.$log('getCode')
      this.code_getting = true
      this.code_getting_stream = setInterval(() => {
        this.code_getting_waited += 1000
      }, 1000)
    },
    async confirmCode () {
      this.$log('confirmCode')
      this.code_confirming = true
    },
    async onSubmit() {
      this.submitting = true;
      if (!this.$refs.phone.hasError && this.$refs.phone.value) {
        this.submitting = true;

        this.auth.loginPhone(this.phone)
          .then(() => {
            this.visibleCodeBlock = true;
          })
          .finally(() => {
            this.submitting = false;
          });
      }
    },
    validateCode(code) {
      if (code > 999 && code < 10000) {
        console.log('== CODE OK', code);
        const params = {
          phone: this.phone,
          code: String(code)
        }

        this.auth.confirmPhone(params).then((result) => {
          console.log('== GQL OK', code);
          if (result) {
            this.$router.push('/greeting');
          } else {
            this.error('Ошибка: Проверьте правильность ввода телефона и кода подтвеврждения');
          }
        }).catch((error) => {
          console.log('== CODE error', error);
        })
      } else {
        // console.log('== CODE failed');
      }
    },
    error(text) {
      this.auth.notifyError(text);
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (this.code_getting_stream) clearInterval(this.code_getting_stream)
  }
}

</script>

<style lang="stylus">
  .flex-double > div
    width 50% !important
</style>
