import fs from "fs-extra";
import path from "path";
import AdmZip from "adm-zip";

interface FileStructure {
  path: string;
  name: string;
  type: string;
}

interface Submodule {
  number: number;
  name: string;
  files: FileStructure[];
}

interface Module {
  number: number;
  name: string;
  submodules: Submodule[];
}

const SERVER_URL = '/videos';
const ALLOWED_EXTENSIONS = new Set([
  ".mp4",
  ".pdf",
  ".mp3",
  ".txt",
  ".png",
  ".jpg",
  ".apkg",
]);

async function getFilesRecursively(
  dir: string,
  baseDir: string,
): Promise<FileStructure[]> {
  // Usamos um Map para evitar duplicatas baseadas no caminho do arquivo
  const filesMap = new Map<string, FileStructure>();

  const items = await fs.readdir(dir, { withFileTypes: true });

  for (const item of items) {
    const itemPath = path.resolve(dir, item.name);

    // 1. Ignorar lixo do macOS e arquivos ocultos
    if (item.name === "__MACOSX" || item.name.startsWith("._")) continue;

    // 2. Lógica para Arquivos ZIP
    if (item.isFile() && item.name.toLowerCase().endsWith(".zip")) {
      const folderName = item.name.slice(0, -4);
      const targetPath = path.resolve(dir, folderName);

      if (!(await fs.pathExists(targetPath))) {
        try {
          console.log(`📦 Extraindo: ${item.name}...`);
          const zip = new AdmZip(itemPath);
          zip.extractAllTo(targetPath, true);
        } catch (err) {
          console.error(`❌ Erro ao extrair ${item.name}:`, err);
          continue;
        }
      }

      // Mapeia o conteúdo da pasta extraída
      const subFiles = await getFilesRecursively(targetPath, baseDir);
      subFiles.forEach((f) => filesMap.set(f.path, f));
      continue;
    }

    // 3. Lógica para Diretórios normais
    if (item.isDirectory()) {
      const zipVersion = itemPath + ".zip";
      if (await fs.pathExists(zipVersion)) {
      }

      const subFiles = await getFilesRecursively(itemPath, baseDir);
      subFiles.forEach((f) => filesMap.set(f.path, f));
    }

    // 4. Lógica para Arquivos permitidos
    else if (item.isFile()) {
      const ext = path.extname(item.name).toLowerCase();

      if (ALLOWED_EXTENSIONS.has(ext)) {
        const relativePath = path
          .relative(baseDir, itemPath)
          .replace(/\\/g, "/");
        const finalPath = `${SERVER_URL}/${encodeURIComponent(relativePath)}`;

        filesMap.set(finalPath, {
          path: finalPath,
          name: item.name,
          type: ext.substring(1),
        });
      }
    }
  }

  return Array.from(filesMap.values());
}

async function generateJson() {
  const baseDir =
  process.env.VIDEOS_DIR || path.resolve(__dirname, "../../videos");
  try {
    const modules: Module[] = [];
    const items = await fs.readdir(baseDir, { withFileTypes: true });

    // Filtrar apenas diretórios válidos primeiro
    const moduleDirs = items.filter(
      (d) => d.isDirectory() && d.name !== "__MACOSX",
    );

    let latestNumber = 0;

    for (const moduleDir of moduleDirs) {
      const modulePath = path.resolve(baseDir, moduleDir.name);
      const [moduleNumberStr, ...moduleNameParts] = moduleDir.name.split(" - ");
      const moduleName = moduleNameParts.join(" - ") || moduleNumberStr;

      const submodules: Submodule[] = [];
      const subItems = await fs.readdir(modulePath, { withFileTypes: true });
      const submoduleDirs = subItems.filter(
        (d) => d.isDirectory() && d.name !== "__MACOSX",
      );

      let submoduleCounter = 1;

      for (const submoduleDir of submoduleDirs) {
        const submodulePath = path.resolve(modulePath, submoduleDir.name);
        const submoduleParts = submoduleDir.name.split(" ");
        let submoduleNumber: number | null = null;
        const potentialNumber = submoduleParts.pop();

        if (potentialNumber && !isNaN(Number(potentialNumber))) {
          submoduleNumber = parseInt(potentialNumber, 10);
        } else if (potentialNumber) {
          submoduleParts.push(potentialNumber);
        }

        const submoduleName = submoduleParts.join(" ");
        const files = await getFilesRecursively(submodulePath, baseDir);

        submodules.push({
          number: submoduleNumber !== null ? submoduleNumber : submoduleCounter,
          name: submoduleName,
          files,
        });

        if (submoduleNumber === null) submoduleCounter++;
      }

      submodules.sort((a, b) => a.number - b.number);

      const parsedNumber = parseInt(moduleNumberStr, 10);
      const number = !isNaN(parsedNumber) ? parsedNumber : latestNumber + 1;
      latestNumber = number;

      modules.push({
        number,
        name: moduleName,
        submodules,
      });
    }

    modules.sort((a, b) => a.number - b.number);

    const outputFile =
      process.env.JSON_OUTPUT ||
      path.resolve(__dirname, "../../web/public/curso_ingles.json");

    await fs.ensureDir(path.dirname(outputFile));

    await fs.writeJson(outputFile, modules, {
      spaces: 2,
    });
    console.log("✅ JSON gerado com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao gerar JSON:", err);
  }
}

generateJson();
