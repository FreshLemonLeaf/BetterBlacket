export default ({
    title,
    description,
    authors,
    patches,
    settings,
    styles,
    onLoad,
    onStart,
    required,
    disabled
}) => {
    if (!title || !authors?.length || (!onLoad && !onStart && !patches)) return console.error(`ERROR: Plugin does not have a title, authors, or executable functions.`);
    
    let plugin = {
        title,
        description: description || 'No description.',
        authors,
        patches: patches || [],
        settings: settings || [],
        styles: styles || ``,
        onLoad: onLoad || (() => { }),
        onStart: onStart || (() => { }),
        required: required || false,
        disabled: disabled || false
    };

    return plugin;
};