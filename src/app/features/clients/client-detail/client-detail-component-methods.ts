// Méthodes à ajouter à la classe ClientDetailComponent pour la fonctionnalité des statistiques

/**
 * Récupère les types de billets achetés par le client
 */
getTicketTypes(): string[] {
  if (!this.statistiques || !this.statistiques.billets_par_type) {
    return [];
  }
  
  return Object.keys(this.statistiques.billets_par_type);
}

/**
 * Calcule le pourcentage d'un type de billet par rapport au total
 */
getTicketTypePercentage(type: string): number {
  if (!this.statistiques || !this.statistiques.billets_par_type) {
    return 0;
  }
  
  const total = Object.values(this.statistiques.billets_par_type).reduce((sum, count) => sum + count, 0);
  if (total === 0) return 0;
  
  const count = this.statistiques.billets_par_type[type] || 0;
  return (count / total) * 100;
}
