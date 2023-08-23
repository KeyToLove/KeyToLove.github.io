import spawn from 'cross-spawn';
import fs from 'fs';
import inquirer from 'inquirer';
import { cyan, green, yellow } from 'kolorist';
import path from 'path';
import prettier from 'prettier';
import { inc } from 'semver';
import { ReleaseType } from 'semver';

import pkg from '../package.json' assert { type: 'json' };

const currentVersion = pkg.version;

const CWD = process.cwd();

let taskStartTime: number, taskEndTime: number;

const taskLogWithTimeInfo = (logInfo: string, type: 'start' | 'end') => {
  let info = '';
  if (type === 'start') {
    info = `⏩ 开始任务：${logInfo}`;
    taskStartTime = Date.now();
  } else {
    info = `✅ 结束任务：${logInfo}`;
    taskEndTime = Date.now();
  }
  const nowDate = new Date();
  console.log(
    `[${nowDate.toLocaleString()}.${nowDate
      .getMilliseconds()
      .toString()
      .padStart(3, '0')}] ${cyan(info)}
      `
  );

  if (type === 'end') {
    console.log(
      yellow(
        `该步骤耗时:   ${((taskEndTime - taskStartTime) / 1000).toFixed(3)}s ` +
          '\n'
      )
    );
    taskStartTime = taskEndTime = 0;
  }
};

const run = (command: string, args: string[]) => {
  const result = spawn.sync(command, args, {
    stdio: 'inherit',
  });
  if (result.status) {
    process.exit(result.status);
  }
  return result;
};

/**
 * 更新版本号
 * @param nextVersion 新版本号
 */
const getNextVersions = (): { [key in ReleaseType]: string | null } => {
  return {
    major: inc(currentVersion, 'major'),
    minor: inc(currentVersion, 'minor'),
    patch: inc(currentVersion, 'patch'),
    premajor: inc(currentVersion, 'premajor'),
    preminor: inc(currentVersion, 'preminor'),
    prepatch: inc(currentVersion, 'prepatch'),
    prerelease: inc(currentVersion, 'prerelease'),
  };
};

/**
 * 生成CHANGELOG
 */
function generateChangelog() {
  taskLogWithTimeInfo('生成CHANGELOG.md', 'start');

  run('npm', ['run', 'changelog']);

  taskLogWithTimeInfo('生成CHANGELOG.md', 'end');
}

async function updateVersion(nextVersion: string) {
  pkg.version = nextVersion;
  taskLogWithTimeInfo('修改package.json版本号', 'start');
  const code = await prettier.format(JSON.stringify(pkg), {
    parser: 'json',
  });
  fs.writeFileSync(path.resolve(CWD, './package.json'), code);
  taskLogWithTimeInfo('修改package.json版本号', 'end');
}

const prompt = async (): Promise<string> => {
  const nextVersions = getNextVersions();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { nextVersion } = await inquirer.prompt([
    {
      type: 'list',
      name: 'nextVersion',
      message: `请选择将要发布的版本 (当前版本 ${currentVersion})`,
      choices: (Object.keys(nextVersions) as Array<ReleaseType>).map(
        (level) => {
          return {
            name: `${level} => ${nextVersions[level] as string}`,
            value: nextVersions[level],
          };
        }
      ),
    },
  ]);
  return nextVersion as string;
};

/**
 * 将代码提交至git
 */
const push = (nextVersion: string) => {
  taskLogWithTimeInfo('推送代码至git仓库', 'start');
  run('git', ['add', 'package.json', 'CHANGELOG.md']);
  run('git', ['commit', '-m', `v${nextVersion}`, '-n']);
  run('git', ['push']);
  taskLogWithTimeInfo('推送代码至git仓库', 'end');
};

/**
 * library库打包
 */
const build = () => {
  taskLogWithTimeInfo('library库打包', 'start');
  run('npm', ['run', 'build']);
  taskLogWithTimeInfo('library库打包', 'end');
};

/**
 * 发布至npm
 */
// const publish = () => {
//   taskLogWithTimeInfo('发布library', 'start');
//   run('npm', ['run', 'publish']);
//   taskLogWithTimeInfo('发布library', 'end');
// };

async function main() {
  const nextVersion = await prompt();
  const startTime = Date.now();
  /**  =================== 更新版本号 ===================   */
  await updateVersion(nextVersion);
  /**  =================== 生成changelog ===================   */
  generateChangelog();
  /**  =================== 打包 ===================   */
  build();
  /**  =================== 推送代码至git仓库 ===================   */
  push(nextVersion);
  console.log(
    green(
      `✨ 发布流程结束 共耗时${((Date.now() - startTime) / 1000).toFixed(
        3
      )}s \n`
    )
  );
}

main().catch((e) => {
  console.log(e);
});
