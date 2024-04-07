export default ({
    title,
    description,
    author,
    patches,
    settings,
    styles,
    onLoad,
    onStart,
    required,
    disabled
}) => {
    if (!title || !author || (!onLoad && !onStart && !patches)) return console.error(`ERROR: Plugin does not have a title, author, or executable functions.`);
    
    let plugin = {
        title,
        description: description || 'No description.',
        author,
        patches: patches || [],
        settings: settings || [],
        onLoad: onLoad || (() => { }),
        onStart: onStart || (() => { }),
        required: required || false,
        disabled: disabled || false
    };

    bb.plugins.list.push(plugin);
    if (!!styles) bb.plugins.styles[title] = styles;
};