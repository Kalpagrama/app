<template lang="pug">
    q-page.text-center.bold
        .q-pa-md
            h6.text-weight-bold.head-title Регистрация через Телефон
        .q-pa-md.q-gutter-y-sm
            form(ref="form")
                q-input(ref="bePhone" lazy-rules dense="dense" v-model="pnohe" type="phone" mask="(###) ### - ####" hint="(###) ### - ####" :rules="[ val => !!val || '* Введи номер телефона', val => val.length > 7 || 'Минимально 16 символов']")
                    template(v-slot:before)
                        span(style="font-size:10px;") Введи номер телефона
                .q-gutter-y-sm.full-height.q-pa-md.q-mt-sm
                    q-btn(size='12px' style="background: #7030A0; color: white; width: 240px;" type="submit" @click="onSubmitEmail" :loading="submitting") Выслать код (повторно)
                q-input(lazy-rules dense="dense" v-model="number" type="number" mask="(###) ### - ####" hint="(###) ### - ####")
                    template(v-slot:before)
                        span(style="font-size:10px;") Проверочный код

</template>

<script>
    export default {
        name: 'PageMobileRegisterEmail',
        data() {
        return {
            password: null,
            disabled: true,
            testMail: 'test@test.ru',
            submitting: false,
        };
    },
    methods: {
            onSubmitEmail() {
                const user = {
                    password: this.password,
                };
                    this.submitting = true;
                    setTimeout(() => {
                        if (this.$refs.emailReg.value === 'test@test.ru') {
                        this.submitting = false;
                    } else {
                        this.submitting = false;
                        alert(user.password);
                        this.$router.push('greeting');
                    }
                }, 3000);
            },
            created() {
                console.log(this.$refs);
            },
        },
    };

</script>

<style lang="stylus"></style>
