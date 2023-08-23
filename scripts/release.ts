import fs from 'node:fs';
import path from 'node:path';

import { execa } from 'execa';
import inquirer from 'inquirer';
import { cyan, green, yellow } from 'kolorist';
import { createSpinner } from 'nanospinner';
import prettier from 'prettier';
import { inc } from 'semver';
import { ReleaseType } from 'semver';

import pkg from '../package.json';

const currentVersion = pkg.version;

const CWD = process.cwd();

let nextVersion: string;

// const taskLogWithTimeInfo = (logInfo: string, type: 'start' | 'end') => {
//   let info = '';
//   if (type === 'start') {
//     info = `⏩ 开始任务：${logInfo}`;
//     taskStartTime = Date.now();
//   } else {
//     info = `✅ 结束任务：${logInfo}`;
//     taskEndTime = Date.now();
//   }
//   const nowDate = new Date();
//   console.log(
//     `[${nowDate.toLocaleString()}.${nowDate
//       .getMilliseconds()
//       .toString()
//       .padStart(3, '0')}] ${cyan(info)}
//       `
//   );

//   if (type === 'end') {
//     console.log(
//       yellow(
//         `该步骤耗时:   ${((taskEndTime - taskStartTime) / 1000).toFixed(3)}s ` +
//           '\n'
//       )
//     );
//     taskStartTime = taskEndTime = 0;
//   }
// };

const runTask = async (taskName: string, task: () => Promise<unknown>) => {
  const startTime = new Date();
  const s = createSpinner(`[${startTime.toLocaleString()}.${startTime
    .getMilliseconds()
    .toString()
    .padStart(3, '0')}] ${cyan(`⏩ 开始任务：${taskName}`)}
          `).start();
  try {
    await task();
    const endTime = new Date();
    s.success({
      text: `[${endTime.toLocaleString()}.${endTime
        .getMilliseconds()
        .toString()
        .padStart(3, '0')}] ${cyan(`✅ 结束任务：${taskName}`)}
      `,
    });
    console.log(
      yellow(
        `该步骤耗时:   ${(
          (endTime.getTime() - startTime.getTime()) /
          1000
        ).toFixed(3)}s ` + '\n'
      )
    );
  } catch (error) {
    s.error({ text: `${taskName} failed!` });
    process.exit(1);
  }
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
const generateChangelog = () => {
  return execa('npm', ['run', 'changelog'], {
    stdio: 'inherit',
  });
};

const updateVersion = async () => {
  pkg.version = nextVersion;
  const code = await prettier.format(JSON.stringify(pkg), {
    parser: 'json',
  });
  fs.writeFileSync(path.resolve(CWD, './package.json'), code);
};

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
const push = async () => {
  await execa('git', ['add', 'package.json', 'CHANGELOG.md'], {
    stdio: 'inherit',
  });
  await execa('git', ['commit', '-m', `v${nextVersion}`, '-n'], {
    stdio: 'inherit',
  });
  await execa('git', ['push'], {
    stdio: 'inherit',
  });
};

/**
 * library库打包
 */
const build = async () => {
  await execa('npm', ['run', 'build'], {
    stdio: 'inherit',
  });
};

/**
 * 发布至npm
 */
// const publish = () => {
//   taskLogWithTimeInfo('发布library', 'start');
//   run('npm', ['run', 'publish']);
//   taskLogWithTimeInfo('发布library', 'end');
// };

/**
 * 打tag提交至git
 */
const tag = async () => {
  await execa('git', ['tag', `v${nextVersion}`], {
    stdio: 'inherit',
  });
  await execa('git', ['push', 'origin', 'tag', `v${nextVersion}`], {
    stdio: 'inherit',
  });
};

async function taskQueen() {
  nextVersion = await prompt();
  const startTime = Date.now();
  /**  =================== 更新版本号 ===================   */
  await updateVersion();
  /**  =================== 生成changelog ===================   */
  await runTask('生成changelog', generateChangelog);
  /**  =================== 打包 ===================   */
  await runTask('build', build);
  /**  =================== 推送代码至git仓库 ===================   */
  await runTask('推送代码至git仓库', push);
  /**  =================== 发布至npm ===================   */
  // publish();
  /**  =================== 打tag并推送至git ===================   */
  await runTask('打tag并推送至git', tag);
  console.log(
    green(
      `✨ 发布流程结束 共耗时${((Date.now() - startTime) / 1000).toFixed(
        3
      )}s \n`
    )
  );
}

taskQueen().catch((e) => {
  console.log(e);
});
