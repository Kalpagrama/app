<template lang="pug">
    q-page.text-center.bold
        .q-pa-md
            h5.text-weight-bold.kp-promo__title.head-title Знакомство
            p.text-left.small-text Мы приветствуем открытость и правдивость. Поэтому рассчитываем, что ты не будешь писать придуманные имена.
            p.text-left.small-text То, насколько ты будешь открыт с другими людьми влияет на твой уровень доверия в системе.
            p.text-left.small-text Напиши свое имя, как оно будет отображаться:
            form(ref="form" @submit.prevent="onSubmitName")
                q-input(type="text" ref="name" v-model.trim="nameUser" label="Твое имя" lazy-rules dense="dense" :rules="[ val => !!val || '* Заполните поле!', val => val.length >= 2 || '* Все таки хочется увидеть имя. Будь пожалуйста честным и открытым!']")
                q-btn.q-mt-lg(size='12px' style="background: #7030A0; color: white; width: 240px;" type="submit" :loading="submitting" :disabled="!this.nameUser || this.nameUser.length < 2") Далее
</template>

<script>
    export default {
        name: 'PageMobileGreeting',
            data() {
                return {
                    submitting: false,
                    disabled: false,
                    nameUser: '',
                };
            },
            methods: {
                onSubmitName() {
                    this.submitting = true;
                    setTimeout(() => {
                        if (this.nameUser !== '' || this.nameUser.length < 2) {
                            this.submitting = true;
                            this.$router.push('lessons');
                        } else {
                            this.submitting = false;
                        }
                    }, 3000);
                },
            },
        };
</script>

<style></style>
