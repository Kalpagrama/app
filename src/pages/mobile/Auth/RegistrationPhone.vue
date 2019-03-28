<template lang="pug">
    q-page.text-center.bold
        .q-pa-md
            h6.text-weight-bold.head-title Регистрация через Телефон
        .q-pa-md.q-gutter-y-sm
            form(ref="form" @submit.prevent="onSubmitEmail")
                q-input.flex-double(ref="bePhone" lazy-rules v-model="phone" dense="dense" type="phone" mask="(###) ### - ####" hint="(###) ### - ####")
                    template(v-slot:before)
                        span.extra-small-text Введи номер телефона:
                .q-gutter-y-sm.full-height.q-pa-md.q-mt-sm
                    q-btn.btn-auth(size='12px' :disabled="disabled" type="submit" :loading="submitting") {{textButton}}
                p.text-left.success.text-caption.q-mt-sm(v-if="successPhoneCode") Проверочный код выслан по указанному номеру телефона.
                q-input.text-right.flex-double(v-if="visibleCodeBlock" lazy-rules dense="dense" v-model.number="number" type="password" mask="####" hint="####" )
                    template(v-slot:before)
                        span.extra-small-text Проверочный код:
                //p.text-left.warning.text-caption.q-mt-sm(v-if="errorPhoneCode") Неверный проверочный код, попробуйте отправить повторно
</template>

<script>
    export default {
        name: 'PageMobileRegisterPhone',
        data() {
        return {
            phone: '',
            disabled: true,
            successPhoneCode: false,
/*
            errorPhoneCode: false,
*/
            visibleCodeBlock: false,
            submitting: false,
            textButton: 'Выслать код',
            number: null,
            num: null,
        };
    },
    methods: {
            onSubmitEmail() {
                this.submitting = true;
                setTimeout(() => {
                    this.textButton = 'Выслать код повторно';
                    this.submitting = false;
                    this.successPhoneCode = true;
                    this.visibleCodeBlock = true;
                }, 3000);
            },
        },
        watch: {
            phone() {
                if (this.phone.length >= 16) {
                    this.disabled = false;
                } else {
                    this.disabled = true;
                }
            },
            number(val) {
                this.num = Number(val);
                if (this.num === 1234) {
                    this.$router.push('/greeting');
                }
            },
        },
    };

</script>

<style lang="stylus">
    .flex-double > div
        width 50% !important
</style>
