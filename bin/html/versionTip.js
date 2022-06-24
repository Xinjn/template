exports.VersionTip = (localFepackerVersion, lastFepackerVersion) => {
    return `
    <div class="versionTip">
      <p>
        @ifeng/fepacker 版本不是最新的，当前版本：<strong>${localFepackerVersion}</strong>，最新版本：<strong id="newVersion">${lastFepackerVersion}</strong>
      </p>
    </div>
    `
}
