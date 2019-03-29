<template lang="pug">
    div
        q-page.text-center.bold
            .q-pa-md
                settings-item
                settings-item
</template>

<script>
import Settings from '../../components/Settings';

export default {
    name: 'TEST',
    components: {
        'settings-item': Settings,
    },
    data() {
        return {
            name: 'TEST',
        };
    },
};
</script>
