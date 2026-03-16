// ============ DTR STUDIO ENGINE v2.0 - COMMAND STACK (UNDO/REDO) ============

import type { Command, CommandStackState, PlaceholderMapping, ProcessedAsset } from '@/types/assembly.types';

export class CommandStack {
  private stack: Command[] = [];
  private pointer: number = -1;
  private maxSize: number = 50;
  
  /**
   * Execute a command and add to stack
   */
  async execute(command: Command): Promise<void> {
    // Remove future commands if we're in the middle of history
    if (this.pointer < this.stack.length - 1) {
      this.stack = this.stack.slice(0, this.pointer + 1);
    }
    
    await command.execute();
    
    this.stack.push(command);
    this.pointer++;
    
    // Limit stack size
    if (this.stack.length > this.maxSize) {
      this.stack.shift();
      this.pointer--;
    }
  }
  
  /**
   * Undo last command
   */
  async undo(): Promise<boolean> {
    if (!this.canUndo()) return false;
    
    await this.stack[this.pointer].undo();
    this.pointer--;
    return true;
  }
  
  /**
   * Redo last undone command
   */
  async redo(): Promise<boolean> {
    if (!this.canRedo()) return false;
    
    this.pointer++;
    await this.stack[this.pointer].execute();
    return true;
  }
  
  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.pointer >= 0;
  }
  
  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.pointer < this.stack.length - 1;
  }
  
  /**
   * Get history descriptions
   */
  getHistory(): string[] {
    return this.stack.map((c, i) => 
      i === this.pointer ? `→ ${c.description}` : c.description
    );
  }
  
  /**
   * Clear all history
   */
  clear(): void {
    this.stack = [];
    this.pointer = -1;
  }
  
  /**
   * Get current state
   */
  getState(): CommandStackState {
    return {
      stack: this.stack,
      pointer: this.pointer
    };
  }
}

// ============ SPECIFIC COMMANDS ============

/**
 * Command for mapping an asset to a placeholder
 */
export class MapAssetCommand implements Command {
  constructor(
    private placeholder: string,
    private newAsset: ProcessedAsset | null,
    private oldAsset: ProcessedAsset | null,
    private mappings: Map<string, PlaceholderMapping>,
    private onUpdate: (placeholder: string, resolved: boolean) => void
  ) {}
  
  async execute(): Promise<void> {
    const mapping = this.mappings.get(this.placeholder);
    if (mapping) {
      mapping.asset = this.newAsset || undefined;
      mapping.resolved = this.newAsset !== null;
      this.onUpdate(this.placeholder, mapping.resolved);
    }
  }
  
  async undo(): Promise<void> {
    const mapping = this.mappings.get(this.placeholder);
    if (mapping) {
      mapping.asset = this.oldAsset || undefined;
      mapping.resolved = this.oldAsset !== null;
      this.onUpdate(this.placeholder, mapping.resolved);
    }
  }
  
  get description(): string {
    if (this.newAsset) {
      return `Map "${this.newAsset.originalPath}" → ${this.placeholder}`;
    }
    return `Unmap ${this.placeholder}`;
  }
}

/**
 * Command for batch mapping multiple assets
 */
export class BatchMapCommand implements Command {
  private previousMappings: Map<string, ProcessedAsset | null> = new Map();
  
  constructor(
    private newMappings: Map<string, ProcessedAsset>,
    private mappings: Map<string, PlaceholderMapping>,
    private onUpdate: (placeholder: string, resolved: boolean) => void
  ) {
    // Store previous state
    for (const [placeholder] of newMappings) {
      const mapping = mappings.get(placeholder);
      this.previousMappings.set(placeholder, mapping?.asset || null);
    }
  }
  
  async execute(): Promise<void> {
    for (const [placeholder, asset] of this.newMappings) {
      const mapping = this.mappings.get(placeholder);
      if (mapping) {
        mapping.asset = asset;
        mapping.resolved = true;
        this.onUpdate(placeholder, true);
      }
    }
  }
  
  async undo(): Promise<void> {
    for (const [placeholder, oldAsset] of this.previousMappings) {
      const mapping = this.mappings.get(placeholder);
      if (mapping) {
        mapping.asset = oldAsset || undefined;
        mapping.resolved = oldAsset !== null;
        this.onUpdate(placeholder, mapping.resolved);
      }
    }
  }
  
  get description(): string {
    return `Batch map ${this.newMappings.size} assets`;
  }
}

/**
 * Command for clearing a mapping
 */
export class ClearMappingCommand implements Command {
  private oldAsset: ProcessedAsset | null = null;
  
  constructor(
    private placeholder: string,
    private mappings: Map<string, PlaceholderMapping>,
    private onUpdate: (placeholder: string, resolved: boolean) => void
  ) {
    const mapping = mappings.get(placeholder);
    this.oldAsset = mapping?.asset || null;
  }
  
  async execute(): Promise<void> {
    const mapping = this.mappings.get(this.placeholder);
    if (mapping) {
      mapping.asset = undefined;
      mapping.resolved = false;
      this.onUpdate(this.placeholder, false);
    }
  }
  
  async undo(): Promise<void> {
    const mapping = this.mappings.get(this.placeholder);
    if (mapping && this.oldAsset) {
      mapping.asset = this.oldAsset;
      mapping.resolved = true;
      this.onUpdate(this.placeholder, true);
    }
  }
  
  get description(): string {
    return `Clear mapping for ${this.placeholder}`;
  }
}
