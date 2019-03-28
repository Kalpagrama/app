<template lang="pug">
    q-page.text-center.bold
        .q-pa-md
            h6.text-weight-bold.head-title Восcтановление пароля
        .q-pa-md.q-gutter-y-sm
            form(ref="form")
                q-input(type="email" ref="emailReg" v-model="email" label="Введи email" lazy-rules dense="dense" :rules="[ val => !!val || '* Заполните поле email!', val => /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/.test(val) || 'Введите корректный e-mail']")
                p.text-left.success.text-caption.q-mt-sm(v-if="successRestor") Новый пароль отправлен на указанный почтовый ящик!
                p.text-left.warning.text-caption.q-mt-sm(v-if="falseEmail") Данный email не найден, пожалуйста пройдите этап регистрации!
                .q-gutter-y-sm.full-height.q-pa-md.q-mt-sm
                    q-btn(size='12px' style="background: #7030A0; color: white; width: 240px;" type="submit" @click="onSubmitRestore" :loading="submitting") Восстановить пароль
</template>

<script>
    export default {
        name: 'PageMobilePromo',
        data() {
        return {
            email: null,
            password: null,
            disabled: true,
            successRestor: false,
            falseEmail: false,
            testMail: 'test@test.ru',
            submitting: false,
        };
    },
    methods: {
        onSubmitRestore() {
            const user = {
                email: this.email,
            };
            this.submitting = true;
            setTimeout(() => {
                if (this.$refs.emailReg.value === 'test@test.ru') {
                    this.successRestor = false;
                    this.falseEmail = true;
                    this.submitting = false;
                } else {
                    this.submitting = false;
                    this.successRestor = true;
                    this.falseEmail = false;
                    alert(user.email);
                }
            }, 3000);
        },
    },
    };

</script>

<style lang="stylus"></style>
