export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // API Web pour lire des fichiers côté navigateur
    const reader = new FileReader();
    // resultat : reader.result contient le contenu du fichier
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
