export function newsApi ([from, limit, direction]) {
    const pagination = { from, limit, direction };

    return {
        query: gql`query($pagination: PaginationInput!, $preferWidth: Int!, $preferHeight: Int!) {
            newsFeed(pagination: $pagination){
                oid
                type
                name
                thumbUrl(preferWidth: $preferWidth, preferHeight:$preferHeight)
            }
        }`,
        variables: {
            pagination: pagination,
            preferWidth: 370,
            preferHeight: 420,
        }
    };
}

export function listAuthActionsApi() {

}

export function isUserAuthorizedApi() {

}

export function isUserConfirmedApi() {

}

export function loginApi() {

}

export function logoutApi() {

}

export function restoreApi() {

}
