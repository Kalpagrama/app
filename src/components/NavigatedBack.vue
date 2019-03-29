<template lang="pug">
    q-header.bg-white.text-black(elevated='')
        q-toolbar
            q-btn.q-mr-sm(flat='', round='', dense='', icon='arrow_back' @click="backRoute")
            q-toolbar-title Кальпаграмма
            q-btn(flat='', round='', dense='', icon='more_vert')
</template>
<script>
    export default {
      data() {
        return {};
      },
      methods: {
        backRoute() {
            return this.$router.back();
        },
      },
    };
</script>
