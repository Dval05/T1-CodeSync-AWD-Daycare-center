export const filterMenuByPermissions = (menuConfig, hasAnyPermission) => {
    return menuConfig
        .map(item => {
            if (item.children) {
                const visibleChildren = item.children.filter(child => 
                    !child.permissions?.length || hasAnyPermission(child.permissions)
                );

                return {
                    ...item,
                    visibleChildren
                };
            }

            return item;
        })
        .filter(item => {
            if (item.children) {
                return item.visibleChildren.length > 0;
            }

            return !item.permissions?.length || hasAnyPermission(item.permissions);
        });
};
