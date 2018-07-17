require.config({
    paths: {
        "jquery": ["core/jquery"],
        "lodash": ["core/lodash"],
        "framework": ["frame/framework"]
    },
    shim: {
        framework: ["jquery"]
    }
});
require(["framework"]);