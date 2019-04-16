<template lang="pug">
    q-page.text-center.bold
        .q-pa-md
            h6.text-weight-bold.head-title Регистрация через Телефон
        .q-pa-md.q-gutter-y-sm
            form(ref="form" @submit.prevent="onSubmit")
                q-input.flex-double(ref="phone" lazy-rules v-model="phone" dense="dense" type="phone" mask="(###) ### - ####" hint="(###) ### - ####")
                    template(v-slot:before)
                        span.extra-small-text Введи номер телефона:
                p.text-left.success.text-caption.q-mt-sm(v-if="successPhoneCode") Проверочный код выслан по указанному номеру телефона.
                q-input.text-right.flex-double(v-if="visibleCodeBlock" lazy-rules dense="dense" v-model.number="code" type="password" mask="####" hint="####" )
                    template(v-slot:before)
                        span.extra-small-text Проверочный код:
                .q-gutter-y-sm.full-height.q-pa-md.q-mt-sm
                    q-btn.btn-auth(v-if="!visibleCodeBlock" size='12px' :disabled="disabled" type="submit" :loading="submitting") Выслать код
                    q-btn.btn-auth(v-else size='12px' :disabled="disabled" type="submit" :loading="submitting") Выслать код повторно
                //p.text-left.warning.text-caption.q-mt-sm(v-if="errorPhoneCode") Неверный проверочный код, попробуйте отправить повторно
</template>

<script>
import AuthProvider from '../../../../store/api/AuthProvider';
import AuthMixin from '../AuthMixin';

    export default {
        name: 'PageMobileRegisterPhone',
        mixins: [AuthMixin],
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
            code: null,
        };
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
    methods: {
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
                const params = {
                    phone: this.phone,
                    code: String(code)
                }

                this.auth.confirmPhone(params).then(() => {
                    this.$router.push('/greeting');
                })
            }
        },
    },
};

</script>

<style lang="stylus">
    .flex-double > div
        width 50% !important
</style>
